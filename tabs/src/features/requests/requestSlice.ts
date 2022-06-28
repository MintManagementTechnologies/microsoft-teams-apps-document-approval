import { distinct } from 'common/utils/helpers/arrayHelpers';

// import { IRequestModel, newRequest } from '@common/types/request';
// import { distinct } from '~helpers/arrayHelpers';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../../store';
import { IRequestModel, newRequest } from './request';

export interface IRequestSlice {
   request: IRequestModel,
   formStatus: string,
   isValid: boolean,
}

const initialState: IRequestSlice = {
   request: newRequest,
   formStatus: '',
   isValid: false
}

// const initialState: IRequestModel & { isValid: boolean } = {
//    refNumber: 0,
//    createdById: "",
//    createdByDisplayName: "",
//    subject: "",
//    description: "",
//    docType: "memo",
//    classificationType: "",
//    docTemplate: "",
//    totalLevels: 0,
//    currentLevel: 0,
//    currentApproversUPN: [],
//    prevApproversUPN: [],
//    status: "",
//    outcome: "",
//    version: 0,
//    id: "",
//    title: "",
//    createdTimestamp: 0,
//    modifiedTimestamp: 0,
//    active: false,
//    isValid: false,
// }

const requestSlice = createSlice({
   name: ' request',
   initialState,
   reducers: {
      formStateChanged(state, action) {
         state.formStatus = action.payload;
         return state;
      },
      formValidationChanged(state, action) {
         state.isValid = action.payload;
         return state;
      },
      itemChanged(state, action) {
         state.request = action.payload;
         return state;
      },
      requestUpdated(state, action) {
         const { request, isValid, formStatus } = action.payload;
         if (state.request?.id !== request.id) {
            state.request = request;
            state.formStatus = formStatus;
            state.isValid = isValid;
         }
         return state;
      },
      requestActioned(state, action) {
         const { outcome, currentUserUPN, nextApproversUPN } = action.payload;
         let request = state.request;
         if (outcome === 'approved') {
            if (request.currentLevel < request.totalLevels) {
               state.request.currentLevel = request.currentLevel + 1;
               state.request.status = 'inProgress';
            } else {
               state.request.outcome = 'approved';
               state.request.status = 'complete';
            }
         } else {
            state.request.currentLevel = 1; //TODO: Need to check what the level should be after rejected
            state.request.outcome = outcome;
            state.request.status = 'complete';
         }

         if (state.request.status !== 'complete') {
            state.request.prevApproversUPN = [...request.prevApproversUPN, currentUserUPN].filter(distinct);
            state.request.currentApproversUPN = nextApproversUPN
         } else {
            state.request.currentApproversUPN = request.currentApproversUPN.filter(x => x === currentUserUPN)
            // state.request.currentApproversUPN = request.currentApproversUPN.filter(x => x !== currentUserUPN)
         }

         state.formStatus = 'readyToSubmit';
         return state;
      },
      requestWithdrawn(state, action) {
         const { skippedActors } = action.payload;

         state.request.prevApproversUPN = [...state.request.prevApproversUPN, ...state.request.currentApproversUPN].filter(distinct);
         state.request.currentApproversUPN = [];
         state.request.status = "complete";
         state.request.outcome = "withdrawn";

         state.formStatus = 'readyToWithdraw';
      },
      requestSubmitted(state, action) {
         const { actorLevels, refNumber } = action.payload as { actorLevels: any[], refNumber: number };
         const lvlNo = state.request.currentLevel;
         const currentLevel = actorLevels.find(x => x.level === lvlNo)
         const currentLevelActors = currentLevel.actors as any[];
         const requiredActors = currentLevelActors.filter(x => x.personaType === 'actor');
         console.log(`requiredActors.map((x:any) => x.upn)`);
         console.log(requiredActors.map((x: any) => x.upn));
         state.request.refNumber = state.request.refNumber || refNumber;
         state.request.totalLevels = actorLevels.length;
         state.request.currentApproversUPN = requiredActors.map((x: any) => x.upn);

         if (state.formStatus === 'editing') {
            state.request.version = state.request.version + 1;
            state.request.prevApproversUPN = [];
            state.request.status = "created";
            state.request.outcome = "pending";
         }

         state.formStatus = 'readyToSubmit';
      }
   },
})

export const { requestUpdated, requestActioned, requestSubmitted, requestWithdrawn, formStateChanged, formValidationChanged, itemChanged } = requestSlice.actions;
export default requestSlice.reducer

export const selectRequest = createSelector(
   [(state: RootState) => state.request],
   (requestState: IRequestSlice) => requestState.request
);

export const selectRequestId = createSelector(
   [(state: RootState) => state.request],
   (requestState: IRequestSlice) => requestState.request.id
);

export const selectRequestFormStatus = createSelector(
   [(state: RootState) => state.request],
   (requestState: IRequestSlice) => ({ formStatus: requestState.formStatus, isValid: requestState.isValid })
);

// export const selectActorLevel = createSelector(
//    [(state: any) => state.actorLevels, (state, id) => id],
//    (actorLevels, id) => actorLevels.find((x: IActorLevel) => x.id === id)
// );

// export const selectActiveLevel = createSelector(
//    [(state: any) => state.actorLevels, (state, active) => active],
//    (actorLevels) => actorLevels.find((x: IActorLevel) => x.active)
// );

// export const selectAllActors = createSelector(
//    [(state: RootState) => state.actorLevels],
//    (actorLevels: IActorLevel[]) => {
//       let allActors: IActorModel[] = [];

//       actorLevels.forEach((level) => {
//          allActors.push(...level.actors);
//       })
//       return allActors;
//    }
// );