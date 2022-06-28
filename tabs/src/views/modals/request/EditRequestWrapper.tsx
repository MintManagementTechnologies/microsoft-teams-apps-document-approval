import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import { useLazyGetTeamConfigQuery } from 'features/config/configService';
import { selectAttachmentIsValid } from 'features/files/fileSlice';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// import { getRouteParams } from '~helpers/urlHelpers';
import { Button, Flex, Segment } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import {
    useCreateManyActorsMutation, useUpdateManyActorsMutation
} from '../../../features/actors/actorService';
import {
    allActorsSkipped, allActorsSubmitted, selectActorFormStatus
} from '../../../features/actors/actorsSlice';
import {
    useNotifyActorsMutation, useNotifyRequestorMutation, useNotifyTeamMutation
} from '../../../features/notifications/notificationService';
import {
    useGetRequestQuery, useUpdateRequestMutation
} from '../../../features/requests/requestService';
import {
    requestSubmitted, requestUpdated, requestWithdrawn, selectRequest, selectRequestFormStatus
} from '../../../features/requests/requestSlice';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';
//import { v4 as uuidv4 } from 'uuid';
import EditForm from './EditForm';

const EditRequestWrapper = (): JSX.Element => {
   const { t } = useTranslation();
   const dispatch = useAppDispatch();
   const [errorMsg, setErrorMsg] = useState('');
   const [submitted, setSubmitted] = useState(false);
   const { userScope, view, action, id } = getRouteParams(window.location.hash);
   const requestId = id || 'notFound';

   const actorFormStatus = useSelector(selectActorFormStatus);
   const requestFormStatus = useSelector(selectRequestFormStatus);
   const selectedRequest = useSelector(selectRequest);
   const allActorLevels = useTypedSelector((state: RootState) => state.actors.actorLevels);
   const allActors = useTypedSelector((state: RootState) => state.actors.allActors);
   const attachmentIsValid = useSelector(selectAttachmentIsValid);
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   const currentUserUPN = currentUser.upn;

   const { data: dataGetRequest, isLoading: isLoadingGetRequest, isFetching: isFetchingGetRequest } = useGetRequestQuery(requestId || skipToken);
   const [updateRequest, { isLoading: isLoadingUpdateRequest, isError: isErrorUpdateRequest }] = useUpdateRequestMutation();
   const [updateManyActors, { isLoading: isLoadingUpdateManyActors, isError: isErrorUpdateManyActors }] = useUpdateManyActorsMutation();
   const [createManyActors, { isLoading: isLoadingCreateManyActors, isError: isErrorCreateManyActors }] = useCreateManyActorsMutation();
   const [notifyRequestor, { isLoading: isLoadingNotifyRequestor, isError: isErrorNotifyRequestor }] = useNotifyRequestorMutation();
   const [notifyActors, { isLoading: isLoadingNotifyActors, isError: isErrorNotifyActors }] = useNotifyActorsMutation();
   const [notifyTeam, { isLoading: isLoadingNotifyTeam, isError: isErrorNotifyTeam }] = useNotifyTeamMutation();

   const [triggerGetTeamConfig, { isLoading: isLoadingGetTeamConfig, isError: isErrorGetTeamConfig }] = useLazyGetTeamConfigQuery();

   useEffect(() => {
      if (!dataGetRequest) return;
      dispatch(requestUpdated({ request: dataGetRequest, isValid: true, formStatus: `editing` }));
   }, [dataGetRequest])

   useEffect(() => {
      if (!(actorFormStatus.formStatus === 'readyToSubmit' && requestFormStatus.formStatus === 'readyToSubmit')) return;
      if (submitted) return;
      try {
         setSubmitted(true);
         notifyRequestor({ request: selectedRequest, actors: allActors });
         notifyActors({ request: selectedRequest, actors: allActors });
         updateRequest(selectedRequest).unwrap();
         createManyActors(allActors).unwrap();
         microsoftTeams.tasks.submitTask("refresh");
      } catch (error: any) {
         if (error.data && error.data.title) {
            setErrorMsg(`${error.status} - ${error.data.title}`);
            console.log(error.data);
         } else {
            setErrorMsg('EditRequestWrapper - Unknown error occured in handleOnSubmit')
         }
      }
   }, [actorFormStatus, requestFormStatus]);

   useEffect(() => {
      if (!(actorFormStatus.formStatus === 'readyToWithdraw' && requestFormStatus.formStatus === 'readyToWithdraw')) return;
      if (submitted) return;
      try {
         setSubmitted(true);
         updateRequest(selectedRequest).unwrap();
         updateManyActors(allActors).unwrap();
         microsoftTeams.tasks.submitTask("refresh");
      } catch (error: any) {
         if (error.data && error.data.title) {
            setErrorMsg(`${error.status} - ${error.data.title}`);
            console.log(error.data);
         } else {
            setErrorMsg('EditRequestWrapper - Unknown error occured in handleOnWithdraw')
         }
      }
   }, [actorFormStatus, requestFormStatus]);

   const handleOnSubmit = async (event: any) => {
      event.preventDefault();
      try {
         dispatch(allActorsSubmitted({ currentLevel: 1, version: selectedRequest.version + 1, requestId: selectedRequest.id, operationOption: `new` }));
         dispatch(requestSubmitted({ actorLevels: allActorLevels }));
      } catch (error: any) {
         setErrorMsg('EditRequestWrapper - Unknown error occured in handleOnSubmit');
      }
   }

   const handleOnWithdraw = (event: any) => {
      event.preventDefault();
      try {
         dispatch(allActorsSkipped({ outcome: 'withdrawn' }));
         dispatch(requestWithdrawn({ skippedActors: allActors }));
      } catch (error: any) {
         setErrorMsg('EditRequestWrapper - Unknown error occured in handleOnWithdraw');
      }
      //microsoftTeams.tasks.submitTask("cancel");
   }

   const handleOnDocRequest = (_event: any) => {
      if (_event !== null) _event.preventDefault();
      triggerGetTeamConfig(selectedRequest.docType).unwrap().then((result) => {
         notifyTeam({ request: selectedRequest, docRequestedBy: currentUser, teamConfig: result });
         microsoftTeams.tasks.submitTask("cancel");
      });
   }


   const setEditActorsPermission = (_userId: string) => {
      if (selectedRequest.createdById !== _userId || selectedRequest.outcome === 'withdrawn' || selectedRequest.outcome === 'approved') return false;
      if (selectedRequest.outcome === 'rejected') return 'all';
      return 'incomplete';
   }

   const formPermissions = {
      editActors: setEditActorsPermission(currentUser.id),
      editAttachments: selectedRequest.createdById === currentUser.id && selectedRequest.outcome === 'rejected',
      viewTemplate: selectedRequest.createdById === currentUser.id && selectedRequest.outcome === 'rejected',
      addComments: !(selectedRequest.outcome === 'approved' || selectedRequest.outcome === 'withdrawn'),
   }
   const canUpdate = attachmentIsValid && dataGetRequest && dataGetRequest.outcome === 'rejected';
   const canWithdraw = dataGetRequest && dataGetRequest.outcome !== 'withdrawn' && dataGetRequest.outcome !== 'approved';
   const isLoading = isLoadingGetTeamConfig || isLoadingNotifyTeam;
   return (
      <>
         <EditForm
            item={selectedRequest}
            permissions={formPermissions}
            action={(canUpdate || canWithdraw) ? action as any : 'view'}
         />
         <Segment className={"mmt-footer-container"}>
            <Flex fill hAlign="end" gap="gap.small">
               {selectedRequest.outcome === 'approved' &&
                  <Button
                     content={t('common:button.requestDoc')}
                     primary
                     onClick={handleOnDocRequest}
                     loading={isLoading}
                     disabled={isLoading}
                  />
               }
               {selectedRequest.outcome !== 'approved' &&
                  <>
                     {selectedRequest.createdById !== currentUser.id ?
                        <Button
                           content={t('common:button.close')}
                           onClick={(event) => microsoftTeams.tasks.submitTask("cancel")}
                        />
                        :
                        <>
                           <Button
                              content={t('common:button.withdraw')}
                              onClick={(event) => handleOnWithdraw(event)}
                              disabled={!canWithdraw}
                           />
                           <Button
                              content={t(`common:button.resubmit`)}
                              primary
                              onClick={(event) => handleOnSubmit(event)}
                              disabled={!canUpdate}
                           />
                        </>
                     }
                  </>
               }
            </Flex>
         </Segment>
      </>
   );
}

export default EditRequestWrapper;