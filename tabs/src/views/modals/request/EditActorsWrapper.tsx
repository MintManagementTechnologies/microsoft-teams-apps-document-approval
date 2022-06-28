import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import { useNotifyActorsMutation } from 'features/notifications/notificationService';
// import { IActorLevel, IActorModel } from 'features/actors/actor';
import { IRequestModel } from 'features/requests/request';
import { requestUpdated } from 'features/requests/requestSlice';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { IActorLevel, IActorModel } from '@common/types/actor';
// import { IRequestModel } from '@common/types/request';
// import { getRouteParams } from '~helpers/urlHelpers';
import { Button, Flex, Segment } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import Loader from '../../../components/common/Loader';
import ActorLevelsList from '../../../features/actors/actorLevels/ActorLevelsList';
import {
    selectAllActors, useCreateActorMutation, useCreateManyActorsMutation, useDeleteActorMutation,
    useGetRequestActorsQuery
} from '../../../features/actors/actorService';
import {
    actorLevelsChanged, allActorsSubmitted, selectActiveLevel, selectActorFormStatus,
    selectAllActorsFromLevels
} from '../../../features/actors/actorsSlice';
import {
    useGetRequestQuery, useUpdateRequestMutation
} from '../../../features/requests/requestService';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';

const EditActorsWrapper = (): JSX.Element => {
   const { t } = useTranslation();
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const { id } = getRouteParams(window.location.hash);
   const requestId = id || 'notFound';

   const [oldActors, setOldActors] = useState<IActorModel[]>([]);

   const allActors = useTypedSelector((state: RootState) => state.actors.allActors);
   const activeLevel = useSelector(selectActiveLevel) as IActorLevel;
   const actorFormStatus = useSelector(selectActorFormStatus);

   const currentUser = useTypedSelector((state: RootState) => state.currentUser);

   const { data: dataGetRequest, isLoading: isLoadingGetRequest, isFetching: isFetchingGetRequest } = useGetRequestQuery(requestId || skipToken);
   const { data: dataGetRequestActors, isLoading: isLoadingGetRequestActors, isFetching: isFetchingGetRequestActors } = useGetRequestActorsQuery(requestId || skipToken);

   const [updateRequest, { isLoading: isLoadingUpdateRequest }] = useUpdateRequestMutation();
   const [createManyActors, { isLoading: isLoadingCreateManyActors, isError: isErrorCreateManyActors }] = useCreateManyActorsMutation();
   const [deleteActor, { isLoading: isLoadingDeleteActor }] = useDeleteActorMutation();
   const [notifyActors, { isLoading: isLoadingNotifyActors, isError: isErrorNotifyActors }] = useNotifyActorsMutation();
   // const [deleteManyActors, { isLoading: isLoadingDeleteManyActors }] = useDeleteManyActorsMutation();

   useEffect(() => {
      if (!dataGetRequestActors || oldActors.length > 0) return;
      setOldActors(dataGetRequestActors);
   }, [oldActors, allActors, dataGetRequestActors]);

   useEffect(() => {
      if (!dataGetRequestActors || !dataGetRequest || allActors.length > 0 || oldActors.length > 0) return;
      // setOldActors(dataGetRequestActors);
      dispatch(requestUpdated({ request: dataGetRequest, isValid: true, formStatus: `editing` }));
      dispatch(actorLevelsChanged(dataGetRequestActors.filter(x => x.version === dataGetRequest.version)));
   }, [dataGetRequestActors, dataGetRequest, allActors, oldActors]);

   const updateRequestCurrentApprovers = async (_newApproversUPN: string[]) => {
      const request = dataGetRequest as IRequestModel;
      let updatedRequest = {
         ...request,
         id: requestId,
         currentApproversUPN: _newApproversUPN,
      }

      await updateRequest(updatedRequest);
   }

   const deletePreviousActors = async () => {
      let toDeleteActors: IActorModel[] = [];
      const incompleteNewActors = allActors.filter(x => x.status !== 'complete');
      const incompleteOldActors = oldActors.filter(x => x.status !== 'complete');
      incompleteOldActors.forEach(x => {
         if (incompleteNewActors.findIndex(y => y.id === x.id) < 0) {
            toDeleteActors.push(x);
         }
      });

      toDeleteActors.forEach(async (x) => await deleteActor({ requestId: x.requestId, actorId: x.id }));
      //await deleteManyActors(toDeleteActors.map(x => x.id));
   }

   const saveNewActors = async () => {
      let toAddActors: IActorModel[] = [];
      const incompleteNewActors = allActors.filter(x => x.status !== 'complete');
      const incompleteOldActors = oldActors.filter(x => x.status !== 'complete');
      incompleteNewActors.forEach(x => {
         if (incompleteOldActors.findIndex(y => y.id === x.id) < 0) {
            toAddActors.push({
               requestId: requestId,
               userId: x.userId,
               upn: x.upn,
               personaType: x.personaType,
               level: x.level,
               id: x.id,
               title: x.title,
               endorsementType: x.endorsementType,
               completedTimestamp: 0,
               status: x.level === dataGetRequest?.currentLevel ? "inProgress" : "notStarted",
               outcome: x.level === dataGetRequest?.currentLevel ? "pending" : "",
               version: dataGetRequest?.version || 0,
               createdTimestamp: new Date().getTime(),
               modifiedTimestamp: new Date().getTime(),
               active: true
            });
         }
      });
      const currentActors = toAddActors.filter(x => x.status === 'inProgress' && x.personaType === 'actor');
      if (currentActors.length > 0 && dataGetRequest) {
         await updateRequestCurrentApprovers(currentActors.map(x => x.upn));
         notifyActors({ request: dataGetRequest, actors: allActors });
      }
      //toAddActors.forEach(async (x) => await createActor(x));
      if (toAddActors.length > 0)
         await createManyActors(toAddActors);
   }

   const handleOnSubmit = async (event: any) => {
      event.preventDefault();
      if (!dataGetRequest) return;
      if (dataGetRequest.outcome === 'pending') {
         await deletePreviousActors()
         await saveNewActors();
      } else {
         dispatch(allActorsSubmitted({ currentLevel: 1, version: dataGetRequest.version, requestId: dataGetRequest.id }))
         //dispatch(actorLevelsChanged(allActorsFromLevels));
      }
      // if (window.history.state.idx === 1) navigate(-1);
      // else {
         microsoftTeams.tasks.submitTask("refresh");
      // }
   }

   const handleOnCancel = (event: any) => {
      event.preventDefault();
      if (window.history.state.idx === 1) navigate(-1);
      else {
         microsoftTeams.tasks.submitTask("cancel");
      }
   }

   const setEditActorsPermission = (_userId: string) => {
      if (!dataGetRequest) return false;
      if (dataGetRequest.createdById !== _userId || dataGetRequest.outcome === 'approved' || dataGetRequest.outcome === 'withdrawn') return false;
      if (dataGetRequest.outcome === 'rejected') return 'all';
      return 'incomplete';
   }

   const formIsValid = allActors.length > 0 && !activeLevel;
   const isLoading = isLoadingGetRequest || isFetchingGetRequest || isLoadingGetRequestActors || isFetchingGetRequestActors || isLoadingDeleteActor || isLoadingUpdateRequest || isLoadingCreateManyActors;
   return (
      <>
         {isLoading ? <Loader message={t('common:entity.user', { count: 0 })} /> :
            <ActorLevelsList displayMode={'edit'} editPermissions={setEditActorsPermission(currentUser.id)} />
         }
         <Segment className={"mmt-footer-container"}>
            <Flex fill hAlign="end" gap="gap.small">
               <Button
                  content={t('common:button.cancel')}
                  onClick={(event) => handleOnCancel(event)}
               />
               <Button
                  content={t(`common:button.update`)}
                  primary
                  onClick={(event) => handleOnSubmit(event)}
                  disabled={!formIsValid}
               />
            </Flex>
         </Segment>
      </>
   );
}

export default EditActorsWrapper;