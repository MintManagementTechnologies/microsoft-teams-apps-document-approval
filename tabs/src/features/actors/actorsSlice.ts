import { checkForDuplicates, groupBy, sortBy } from 'common/utils/helpers/arrayHelpers';
import { v4 as uuid } from 'uuid';

// import { IActorLevel, IActorModel } from '@common/types/actor';
// import { groupBy, sortBy } from '~helpers/arrayHelpers';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import { availablePersonas, requiredPersonas } from '../../common/types';
import { RootState } from '../../store';
import { IActorLevel, IActorModel } from './actor';

export interface IActorsSlice {
   allActors: IActorModel[],
   currentActor: IActorModel | null,
   actorLevels: IActorLevel[],
   activeLevel: IActorLevel | null,
   formStatus: string,
   isValid: boolean,
}

let defaultActorLevel = {
   endorsementType: "",
   level: 1,
   availablePersonas: ['actor', 'pa'],
   requiredPersonas: ['actor'],
   actors: [],
   status: "",
   outcome: "",
   id: "",
   title: "Actor & PA",
   createdTimestamp: 0,
   modifiedTimestamp: 0,
   active: false,
};

const initialState: IActorsSlice = {
   allActors: [],
   currentActor: null,
   actorLevels: [],
   activeLevel: null,
   formStatus: '',
   isValid: false,
};

const actorsSlice = createSlice({
   name: 'actors',
   initialState,
   reducers: {
      currentActorSelected(state, action) {
         const { currentActor, isValid, formStatus } = action.payload;
         if (state.currentActor?.id !== currentActor.id) {
            state.currentActor = currentActor;
            state.formStatus = formStatus;
            state.isValid = isValid;
         }
      },
      activeLevelSelected(state, action) {
         const { level, id } = action.payload
         const selectedActiveLevel = state.actorLevels.find(x => x.id === id);
         if (selectedActiveLevel) {
            state.activeLevel = selectedActiveLevel;
            state.isValid = false;
         }
      },
      actorLevelsChanged(state, action) {
         let allActors: IActorModel[] = action.payload;
         state.allActors = [...allActors].sort((a, b) => a.level - b.level);

         const actorsGroupedByLevel = groupBy(allActors, 'level');
         for (let [key, value] of Object.entries(actorsGroupedByLevel)) {
            const lvlActors = (value as IActorModel[]).sort((a: IActorModel, b: IActorModel) => sortBy(a.personaType || '', b.personaType || ''));
            const lvlEndorsementType = lvlActors.length > 0 ? lvlActors[0].endorsementType : 'error-endorsementType';
            const lvlStatus = lvlActors.length > 0 ? lvlActors[0].status : 'error-status';
            const lvlOutcome = lvlActors.length > 0 ? lvlActors[0].outcome : 'error-outcome';
            let lvlProps = {
               endorsementType: lvlEndorsementType,
               level: parseInt(key),
               availablePersonas: availablePersonas,
               requiredPersonas: requiredPersonas,
               actors: lvlActors,
               status: lvlStatus,
               outcome: lvlOutcome,
               id: uuid(), //`lvl-${key}`,
               title: 'form.actorLevel.title',
               createdTimestamp: new Date().getTime(),
               modifiedTimestamp: new Date().getTime(),
               active: false,
            }
            state.actorLevels.push(lvlProps);
         }
      },
      actorLevelAdded(state, action) {
         const { id, level, endorsementType, actors } = action.payload
         const existingLevel = state.actorLevels.find(x => x.id === id);
         if (existingLevel) {
            existingLevel.endorsementType = endorsementType;
            existingLevel.level = level;
            existingLevel.actors = actors;
         } else {
            state.actorLevels.push(action.payload);
         }
         state.activeLevel = existingLevel || action.payload;
      },
      actorLevelUpdated(state, action) {
         const { id, level, endorsementType, actors } = action.payload
         const existingLevel = state.actorLevels.find(x => x.id === id);
         if (existingLevel) {
            const existingActorIds = existingLevel.actors.map(x => x.id);
            const tmpAllActorsState = state.allActors
               .filter((x) => !existingActorIds.includes(x.id));
            tmpAllActorsState.push(...actors);
            state.allActors = tmpAllActorsState;

            existingLevel.endorsementType = endorsementType;
            existingLevel.level = level;
            existingLevel.actors = [...actors].sort((a: IActorModel, b: IActorModel) => sortBy(a.personaType || '', b.personaType || ''));
            existingLevel.status = 'pendingSave';
         }
         if (state.formStatus !== 'creating')
            state.formStatus = 'creating';
         state.activeLevel = null;
         state.isValid = true;
      },
      actorLevelDeleted(state, action) {
         const { level, id } = action.payload
         state.actorLevels = state.actorLevels
            .filter(x => x.id !== id)
            .map(x => {
               if (x.level < level) return x;
               return {
                  ...x,
                  level: x.level - 1
               }
            });
         state.allActors = state.allActors
            .filter(x => x.level !== level)
            .map(x => {
               if (x.level < level) return x;
               return {
                  ...x,
                  level: x.level - 1
               }
            });
         state.activeLevel = null;
         state.isValid = state.actorLevels.length > 0;
      },
      allActorsSubmitted(state, action) {
         const { currentLevel, version, requestId, operationOption } = action.payload as { currentLevel: number, version: number, requestId: string, operationOption?: string };

         let newAllActors: IActorModel[] = [];
         const isNewId = operationOption === 'new';
         state.actorLevels.forEach((level) => {
            let _actors = level.actors.map((actor) => ({
               ...actor,
               id: isNewId ? uuid() : (actor.id || uuid()), //TODO: check if it should ALWAYS be new?
               requestId: requestId,
               completedTimestamp: 0,
               status: actor.level === currentLevel ? "inProgress" : "notStarted",
               outcome: actor.level === currentLevel ? "pending" : "",
               version: version,
               endorsementType: level.endorsementType
            }));
            newAllActors.push(..._actors);
         })
         state.allActors = newAllActors;

         state.formStatus = 'readyToSubmit';
      },
      allActorsSkipped(state, action) {
         const { outcome } = action.payload;

         let newAllActors: IActorModel[] = [];

         state.actorLevels.forEach((level) => {
            let _actors = level.actors.map((actor) => ({
               ...actor,
               completedTimestamp: new Date().getTime(),
               status: actor.status === 'complete' ? 'complete' : 'neverStarted',
               outcome: actor.status === 'complete' ? actor.outcome : 'skipped',
               endorsementType: level.endorsementType
            }));
            newAllActors.push(..._actors);
         })
         state.allActors = newAllActors;

         state.formStatus = 'readyToWithdraw';
      },

      actorActionCompleted: {
         reducer(state, action) {
            const { id, level, completedTimestamp, status, outcome } = action.payload;

            if (state.currentActor && state.currentActor.id === id) {
               state.currentActor.completedTimestamp = completedTimestamp;
               state.currentActor.status = status;
               state.currentActor.outcome = outcome;
            }
            const allActors = state.allActors;

            //status -> "inProgress" | "complete" //outcome -> "pending" | "skipped"
            state.allActors = allActors.map(x => {
               if (x.id === id) {
                  return state.currentActor;
               } else if (x.level === level) {
                  return {
                     ...x,
                     completedTimestamp: completedTimestamp,
                     status: status,
                     outcome: outcome,
                  }
               } else if (outcome === 'rejected' && x.level > level) {
                  return {
                     ...x,
                     status: 'complete',
                     outcome: 'skipped',
                  }
               } else if (outcome !== 'rejected' && x.level === (level + 1)) {
                  return {
                     ...x,
                     status: 'inProgress',
                     outcome: 'pending',
                  }
               }
               return x;
            }) as IActorModel[];

            state.formStatus = 'readyToSubmit';
            // return state;
         },
         prepare(_actorId, _level, _endorsementType, _outcome): any {
            let outcome = _outcome;
            if (_outcome === 'approved') {
               if (_endorsementType === 'recommender')
                  outcome = 'recommended'
               else if (_endorsementType === 'supporter')
                  outcome = 'supported'
            }

            const updatedActor = {
               id: _actorId,
               level: _level,
               completedTimestamp: new Date().getTime(),
               status: 'complete',
               outcome: outcome,
            }

            return {
               payload: updatedActor,
            }
         },
      },
   },
})

export const { currentActorSelected, activeLevelSelected, actorLevelsChanged, actorLevelAdded, actorLevelUpdated, actorLevelDeleted, actorActionCompleted, allActorsSubmitted, allActorsSkipped } = actorsSlice.actions;
export default actorsSlice.reducer

export const selectActorLevel = createSelector(
   [(state: any) => state.actors, (state, id) => id],
   (actorsState: IActorsSlice, id) => actorsState.actorLevels.find((x: IActorLevel) => x.id === id) as IActorLevel
);

export const selectActiveLevel = createSelector(
   [(state: RootState) => state.actors],
   (actorsState: IActorsSlice): IActorLevel | null => actorsState.activeLevel
);

export const selectCurrentActor = createSelector(
   [(state: RootState) => state.actors],
   (actorsState: IActorsSlice): IActorModel | null => actorsState.currentActor
);

export const selectAllActorsFromLevels = createSelector(
   [(state: RootState) => state.actors],
   (actorsState: IActorsSlice): IActorModel[] => {
      let allActors: IActorModel[] = [];

      actorsState.actorLevels.forEach((level) => {
         let _actors = level.actors.map((actor) => ({
            ...actor,
            endorsementType: level.endorsementType
         }));
         allActors.push(..._actors);
      })
      return allActors;
   }
);

export const selectActorFormStatus = createSelector(
   [(state: RootState) => state.actors],
   (actorsState: IActorsSlice): { formStatus: string, isValid: boolean } => ({ formStatus: actorsState.formStatus, isValid: actorsState.isValid })
);

export const selectDuplicateActorsFound = createSelector(
   [(state: RootState) => state.actors.allActors],
   (allActors: IActorModel[]): {
      show: boolean;
      message: string;
   } => {
      const allActorsUPN = allActors.map(x => x.upn);
      const duplicateActorsFound = checkForDuplicates(allActorsUPN)
      return {
         show: duplicateActorsFound,
         message: duplicateActorsFound ? 'Duplicate entries found' : ''
      }
   }
);

export const selectEndorsementTypeValidation = createSelector(
   [(state: RootState) => state.actors.allActors],
   (allActors: IActorModel[]): {
      show: boolean;
      message: string;
   } => {
      const totalRecommenders = allActors.filter(x => x.endorsementType === 'recommender').length;
      const totalApprovers = allActors.filter(x => x.endorsementType === 'approver').length;
      const isInvalid = totalRecommenders > 1 && totalApprovers > 1;
      return {
         show: isInvalid,
         message: isInvalid ? 'Only one recommender and one approver allowed.' : ''
      }
   }
); 