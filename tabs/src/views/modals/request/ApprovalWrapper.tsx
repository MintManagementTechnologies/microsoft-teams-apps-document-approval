// import {
//     useNotifyActorsMutation, useNotifyRequestorMutation
import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import { IActorModel } from 'features/actors/actor';
import { useMoveFilesMutation } from 'features/files/fileService';
import { selectAttachmentIsValid } from 'features/files/fileSlice';
import {
    useNotifyActorsMutation, useNotifyRequestorMutation
} from 'features/notifications/notificationService';
// } from 'features/notifications/notificationService';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// import { IActorModel } from '@common/types/actor';
// import { getRouteParams } from '~helpers/urlHelpers';
import { Alert, Button, Flex, Segment } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import Loader from '../../../components/common/Loader';
import {
    useGetRequestActorsQuery, useUpdateManyActorsMutation
} from '../../../features/actors/actorService';
import {
    actorActionCompleted, actorLevelsChanged, currentActorSelected, selectActorFormStatus
} from '../../../features/actors/actorsSlice';
import {
    useGetRequestQuery, useUpdateRequestMutation
} from '../../../features/requests/requestService';
import {
    requestActioned, requestUpdated, selectRequest, selectRequestFormStatus
} from '../../../features/requests/requestSlice';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';
//import { v4 as uuidv4 } from 'uuid';
import EditForm from './EditForm';

const ApprovalWrapper = (): JSX.Element => {
   const { t } = useTranslation();
   const dispatch = useAppDispatch();
   const { userScope, view, action, id } = getRouteParams(window.location.hash);
   const requestId = id || 'notFound';

   const [endorsementType, setEndorsementType] = useState('approver');
   const [actorEntityId, setActorEntityId] = useState('');
   const [actorLevel, setActorLevel] = useState(0);
   const [errorMsg, setErrorMsg] = useState('');
   const [submitted, setSubmitted] = useState(false);

   const selectedRequest = useSelector(selectRequest);
   const allActors = useTypedSelector((state: RootState) => state.actors.allActors);
   const actorFormStatus = useSelector(selectActorFormStatus);
   const requestFormStatus = useSelector(selectRequestFormStatus);
   const attachmentIsValid = useSelector(selectAttachmentIsValid);
   
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   const currentUserUPN = currentUser.upn;
   const { data: dataGetRequest, isLoading: isLoadingGetRequest, isFetching: isFetchingGetRequest } = useGetRequestQuery(requestId || skipToken);
   const { data: dataGetRequestActors, isLoading: isLoadingGetRequestActors, isFetching: isFetchingGetRequestActors } = useGetRequestActorsQuery(requestId || skipToken);
   const [updateRequest, { isLoading: isLoadingUpdateRequest, isError: isErrorUpdateRequest }] = useUpdateRequestMutation();
   const [updateManyActors, { isLoading: isLoadingUpdateManyActors, isError: isErrorUpdateManyActors }] = useUpdateManyActorsMutation();
   const [moveFiles, { isLoading: isLoadingMoveFiles }] = useMoveFilesMutation();
   const [notifyRequestor, { isLoading: isLoadingNotifyRequestor, isError: isErrorNotifyRequestor }] = useNotifyRequestorMutation();
   const [notifyActors, { isLoading: isLoadingNotifyActors, isError: isErrorNotifyActors }] = useNotifyActorsMutation();

   useEffect(() => {
      if (!(dataGetRequestActors && dataGetRequest)) return;
      const lvlActors = dataGetRequestActors.filter(x => x.level === dataGetRequest.currentLevel);
      const actor = lvlActors.find(x => x.upn === currentUserUPN && x.outcome === 'pending') as IActorModel;
      let formStatus = 'view';
      let isValid = false;
      if (lvlActors.length > 0 && actor) {
         formStatus = 'inProgress'
         isValid = true;
         setEndorsementType(actor.endorsementType);
         setActorEntityId(actor.id);
         setActorLevel(actor.level);
         dispatch(currentActorSelected({ currentActor: actor, isValid: isValid, formStatus: formStatus }));
      }
      dispatch(actorLevelsChanged(dataGetRequestActors));
      dispatch(requestUpdated({ request: dataGetRequest, isValid: isValid, formStatus: formStatus }));
   }, [dataGetRequestActors, dataGetRequest, dispatch]);

   useEffect(() => {
      if(!(actorFormStatus.formStatus === 'readyToSubmit' && requestFormStatus.formStatus === 'readyToSubmit')) return;
      if(!(actorFormStatus.isValid && requestFormStatus.isValid) || submitted) return;
      try {
         setSubmitted(true);
         updateRequest(selectedRequest).unwrap();
         updateManyActors(allActors).unwrap();
         if(selectedRequest.outcome === 'approved'){
            moveFiles({ isNew: false, requestId: selectedRequest.id, refNumber: selectedRequest.refNumber, docType: selectedRequest.docType });
         }
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
   },[actorFormStatus, requestFormStatus]);

   const handleOnClick = async (_event: any, _outcome: string) => {
      if (_event !== null) _event.preventDefault();
      try {
         const nextApproversUPN = (dataGetRequestActors as IActorModel[])
            .filter(x => x.level === selectedRequest.currentLevel + 1 && x.personaType === 'actor')
            .map(x => x.upn);
         dispatch(requestActioned({ outcome: _outcome, currentUserUPN: currentUser.upn, nextApproversUPN: nextApproversUPN }));
         dispatch(actorActionCompleted(actorEntityId, actorLevel, endorsementType, _outcome));
      } catch (error: any) {
         setErrorMsg('ApprovalWrapper - Unknown error occured in handleOnClick')
      }
   }

   const formPermissions = {
      editActors: false,
      editAttachments: selectedRequest.currentApproversUPN.find((x:any) => x === currentUserUPN) !== undefined && selectedRequest.status !== 'complete',
      viewTemplate: false,
      addComments: !(selectedRequest.outcome === 'approved' || selectedRequest.outcome === 'withdrawn'),
   }

   const formIsValid = actorFormStatus.isValid && selectedRequest.currentApproversUPN.find((x:any) => x === currentUserUPN) !== undefined;
   const approveBtnText = endorsementType;
   const isLoading = isLoadingGetRequest || isFetchingGetRequest || isFetchingGetRequestActors || isLoadingGetRequestActors || isLoadingUpdateRequest || isLoadingUpdateManyActors || isLoadingMoveFiles;
   const isError = (isErrorUpdateRequest || isErrorUpdateManyActors) && errorMsg.length > 0;
   return (
      <>
         {isLoading ? <Loader message={t('common:entity.request', { count: 1 })} /> :
            <EditForm
               item={selectedRequest}
               permissions={formPermissions}
               action={'approve'}
            />
         }
         <Segment className={"mmt-footer-container"}>
            {isError ? <Alert content={errorMsg} variables={{ urgent: true, }} dismissible visible={isError}
               dismissAction={{ onClick: (event: any) => setErrorMsg('') }} /> :
               <Flex fill hAlign="end" gap="gap.small">
                  <Button
                     content={t('common:button.reject')}
                     onClick={(event) => handleOnClick(event, 'rejected')}
                     disabled={!formIsValid}
                  />
                  <Button
                     content={t(`common:button.${approveBtnText}`)}
                     primary
                     onClick={(event) => handleOnClick(event, 'approved')}
                     disabled={!(formIsValid && attachmentIsValid)}
                  />
               </Flex>
            }
         </Segment>
      </>
   );
}

export default ApprovalWrapper;