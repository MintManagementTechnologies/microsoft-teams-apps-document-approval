import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import { useMoveFilesMutation } from 'features/files/fileService';
import { selectAttachmentIsValid } from 'features/files/fileSlice';
import { newRequest } from 'features/requests/request';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLazyGetNewRefNumberQuery } from 'services/configService';

// import { newRequest } from '@common/types/request';
// import { getRouteParams } from '~helpers/urlHelpers';
import { Alert, Button, Flex, Segment } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';

import Loader from '../../../components/common/Loader';
import { useCreateManyActorsMutation } from '../../../features/actors/actorService';
import { allActorsSubmitted, selectActorFormStatus } from '../../../features/actors/actorsSlice';
import {
    useNotifyActorsMutation, useNotifyRequestorMutation
} from '../../../features/notifications/notificationService';
import {
    useCreateRequestMutation, useDeleteRequestMutation
} from '../../../features/requests/requestService';
import {
    requestSubmitted, selectRequest, selectRequestFormStatus
} from '../../../features/requests/requestSlice';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';
import NewForm from './NewForm';

const NewRequestWrapper = (): JSX.Element => {
   const { t } = useTranslation();
   const dispatch = useAppDispatch();
   const [errorMsg, setErrorMsg] = useState('');
   const [submitted, setSubmitted] = useState(false);
   const [usersNotified, setUsersNotified] = useState(false);
   
   const { userScope, view, action, id } = getRouteParams(window.location.hash);
   const requestId = id || 'notFound';

   const currentUser = useTypedSelector((state: RootState) => state.currentUser);

   const selectedRequest = useTypedSelector((state: RootState) => state.request.request);
   const allActors = useTypedSelector((state: RootState) => state.actors.allActors);
   const allActorLevels = useTypedSelector((state: RootState) => state.actors.actorLevels);

   const actorFormStatus = useSelector(selectActorFormStatus);
   const requestFormStatus = useSelector(selectRequestFormStatus);
   const attachmentIsValid = useSelector(selectAttachmentIsValid);

   const [trigger, { isLoading: isLoadingGetNewRefNumber, isError: isErrorGetNewRefNumber }] = useLazyGetNewRefNumberQuery();
   const [createRequest, { isLoading: isLoadingCreateRequest, isError: isErrorCreateRequest }] = useCreateRequestMutation();
   const [createManyActors, { isLoading: isLoadingCreateManyActors, isError: isErrorCreateManyActors }] = useCreateManyActorsMutation();
   const [moveFiles, { isLoading: isLoadingMoveFiles }] = useMoveFilesMutation();
   const [deleteRequest, { isLoading: isLoadingDeleteRequest }] = useDeleteRequestMutation();
   const [notifyRequestor, { isLoading: isLoadingNotifyRequestor, isError: isErrorNotifyRequestor }] = useNotifyRequestorMutation();
   const [notifyActors, { isLoading: isLoadingNotifyActors, isError: isErrorNotifyActors }] = useNotifyActorsMutation();
   
   useEffect(() => {
      if (!(actorFormStatus.formStatus === 'readyToSubmit' && requestFormStatus.formStatus === 'readyToSubmit')) return;
      if (!(actorFormStatus.isValid && requestFormStatus.isValid) || submitted) return;
      try {
         setSubmitted(true);
         createRequest(selectedRequest).unwrap();
         createManyActors(allActors).unwrap();
         moveFiles({ isNew: true, requestId: selectedRequest.id, refNumber: selectedRequest.refNumber, docType: selectedRequest.docType });
         notifyRequestor({request: selectedRequest, actors: allActors});
         notifyActors({request: selectedRequest, actors: allActors});
         microsoftTeams.tasks.submitTask("refresh");
      } catch (error: any) {
         if (error.data && error.data.title) {
            setErrorMsg(`${error.status} - ${error.data.title}`);
            console.log(error.data);
         } else {
            setErrorMsg('NewRequestWrapper - Unknown error occured in handleOnSubmit')
         }
      }
   }, [actorFormStatus, requestFormStatus]);

   const handleOnSubmit = async (event: any) => {
      event.preventDefault();
      try {
         trigger().unwrap().then((data) => {
            dispatch(allActorsSubmitted({ currentLevel: 1, version: 0, requestId: requestId }));
            dispatch(requestSubmitted({ actorLevels: allActorLevels, refNumber: data.refNumber }));
         }).catch((error) => {
            setErrorMsg('Could not create the reference number. Please try again.');
         });
      } catch (error: any) {
         setErrorMsg('NewRequestWrapper - Unknown error occured in handleOnSubmit');
      }
   }

   const handleOnCancel = (event: any) => {
      event.preventDefault();
      microsoftTeams.tasks.submitTask("cancel");
   }

   const handleOnDelete = (event: any) => {
      deleteRequest(requestId);
   }

   const formIsValid = requestFormStatus.isValid && allActorLevels.length > 0 && actorFormStatus.isValid && attachmentIsValid;
   const isLoading = isLoadingCreateRequest || isLoadingDeleteRequest || isLoadingCreateManyActors || isLoadingCreateManyActors || isLoadingMoveFiles;
   const isError = (isErrorCreateManyActors || isErrorCreateRequest || isErrorGetNewRefNumber) && errorMsg.length > 0;
   return (
      <>
         {isLoading ? <Loader message={t('common:entity.request', { count: 1 })} /> :
            <NewForm
               item={{
                  ...newRequest,
                  id: requestId,
                  createdById: currentUser.id,
                  createdByUPN: currentUser.upn,
                  createdByDisplayName: currentUser.title,
               }}
            />
         }
         <Segment className={"mmt-footer-container"}>
            {isError ? <Alert content={errorMsg} variables={{ urgent: true, }} dismissible visible={isError}
               dismissAction={{ onClick: (event: any) => setErrorMsg('') }} /> :
               <Flex fill>
                  {/* <Flex hAlign="start">
                     <Button
                        content={t('common:button.delete')}
                        primary
                        onClick={(event) => handleOnDelete(event)}
                     />
                  </Flex> */}
                  <Flex fill hAlign="end" gap="gap.small">
                     <Button
                        content={t('common:button.cancel')}
                        onClick={(event) => handleOnCancel(event)}
                     />
                     <Button
                        content={t(`common:button.submit`)}
                        primary
                        onClick={(event) => handleOnSubmit(event)}
                        disabled={!formIsValid}
                        loading={isLoading}
                     />
                  </Flex>
               </Flex>
            }
         </Segment>
      </>
   );
}

export default NewRequestWrapper;