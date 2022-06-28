import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

import {
    AddIcon, Alert, Button, ExclamationTriangleIcon, Flex, TrashCanIcon
} from '@fluentui/react-northstar';

import { availablePersonas, requiredPersonas } from '../../../common/types';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';
import { IActorLevel } from '../actor';
import {
    actorLevelAdded, selectActiveLevel, selectDuplicateActorsFound, selectEndorsementTypeValidation
} from '../actorsSlice';
import ActorLevel from './ActorLevel';

const ActorLevelsList = (props: {
   displayMode: string, // new, edit, view
   editPermissions: string | boolean, // incomplete | all | false
}): JSX.Element => {
   const { displayMode, editPermissions } = props;

   const dispatch = useAppDispatch();
   const allLevels = useTypedSelector((state: RootState) => state.actors.actorLevels);
   const activeLevel = useSelector(selectActiveLevel) as IActorLevel;
   const duplicateActorsFound = useSelector(selectDuplicateActorsFound);
   const endorsementTypeValidation = useSelector(selectEndorsementTypeValidation);

   const [isValid, setIsValid] = useState(true);
   const [error, setError] = useState({
      show: false,
      message: ''
   });

   const canAddLevel = allLevels.length === 0 || (isValid && (displayMode === 'new' || displayMode === 'edit'));

   useEffect(() => {
      if (!activeLevel) {
         setIsValid(true);
         return;
      }
      if (activeLevel)
         setIsValid(false);
   }, [activeLevel])

   useEffect(() => {
      setIsValid(!duplicateActorsFound.show);
      setError(duplicateActorsFound);
   }, [duplicateActorsFound]);

   useEffect(() => {
      setIsValid(!endorsementTypeValidation.show);
      setError(endorsementTypeValidation);
   }, [endorsementTypeValidation]);

   useEffect(() => {
      if (allLevels.length > 0 || displayMode !== 'new') return;
      handleTotalLevelChange(null)
   }, [allLevels])

   const handleTotalLevelChange = (_event: any) => {
      if (_event !== null) _event.preventDefault();
      let nxtLvl = allLevels.length + 1;
      let defaultLvl = {
         endorsementType: "new",
         level: nxtLvl,
         availablePersonas: availablePersonas,
         requiredPersonas: requiredPersonas,
         actors: [],
         status: "editing",
         outcome: "",
         id: uuid(), //`lvl-${nxtLvl}`,
         title: t('form.actorLevel.title'),
         createdTimestamp: 0,
         modifiedTimestamp: 0,
         active: true,
      };
      dispatch(actorLevelAdded(defaultLvl));
      setIsValid(false);
   }

   const getDisplayMode = (_displayMode: string, _editPermissions: string | boolean, _status: string): string => {
      if (!_editPermissions) return 'locked';
      if (_editPermissions === 'incomplete' && _status === 'complete') return 'locked';
      if (_displayMode === 'new' && allLevels.length === 0) return 'edit';
      return 'view';
   }

   return (
      <>
         {allLevels.map((x, i) =>
            <ActorLevel
               key={`actorLvl-${i}`}
               levelId={x.id}
               displayMode={getDisplayMode(displayMode, editPermissions, x.status)}
            />
         )}
         {error.show && <Alert icon={<ExclamationTriangleIcon />} className="mmt-errorMessage" danger content={error.message}
            visible={error.show}
         />}
         {(editPermissions === 'all' || editPermissions === 'incomplete') &&
            <Flex fill space="between">
               <Button icon={<AddIcon />} content={t('common:button.addMore')} text size="small" primary
                  onClick={(event) => handleTotalLevelChange(event)}
                  disabled={!canAddLevel}
               />
            </Flex>
         }
      </>
   );
}

export default ActorLevelsList;