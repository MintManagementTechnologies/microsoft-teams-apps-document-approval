import { getBaseUrl } from 'common/utils/helpers/urlHelpers';
import { useTranslation } from 'react-i18next';

import {
    AcceptIcon, Button, EditIcon, EyeFriendlierIcon, UserFriendsIcon
} from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';

import { IRequestModel } from '../../../features/requests/request';
import { useLazyGetRequestsByActorQuery } from '../../../features/requests/requestService';
import { RootState, useTypedSelector } from '../../../store';

const RequestActions = (props: { request: IRequestModel }): JSX.Element => {
   const { request } = props;
   const { t, i18n } = useTranslation();
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   // let userUPN;
   const [trigger] = useLazyGetRequestsByActorQuery();
   const handleOnActionClick = (_event: any, _action: string, _id: string) => {

      const submitHandler = (err: any, result: any) => {
         if (result === "refresh") {
            trigger(currentUser.upn);
         } else {
            console.log("DONT REFRESH");
         }
      };

      const taskInfo = {
         url: getBaseUrl() + `/me/memo/${_action}/${_id}`,
         title: `${t(`taskModule.title.${_action}`)}`,
         height: 400,
         width: 400,
      };
      microsoftTeams.tasks.startTask(taskInfo, submitHandler);
   }

   const buttons = [{
      icon: <EyeFriendlierIcon />,
      key: `view-${request.id}`,
      iconOnly: true,
      text: true,
      title: 'View',
      onClick: (event: any) => handleOnActionClick(event, 'view', request.id)
   }];
   // if (request.createdById === currentUser.id && !(request.outcome === 'approved' || request.outcome === 'withdrawn')) {
   //    buttons.push({
   //       icon: <EditIcon />,
   //       key: `edit-${request.id}`,
   //       iconOnly: true,
   //       text: true,
   //       title: 'Edit',
   //       onClick: (event: any) => handleOnActionClick(event, 'edit', request.id)
   //    });
   // }
   if (request.createdById === currentUser.id && request.status !== 'complete') {
      buttons.push({
         icon: <UserFriendsIcon />,
         key: `editactors-${request.id}`,
         iconOnly: true,
         text: true,
         title: 'Edit Actors',
         onClick: (event: any) => handleOnActionClick(event, 'editactors', request.id)
      });
   }
   if (request.currentApproversUPN.includes(currentUser.upn) && request.status !== 'complete') {
      buttons.push({
         icon: <AcceptIcon />,
         key: `approve-${request.id}`,
         iconOnly: true,
         text: true,
         title: 'Action',
         onClick: (event: any) => handleOnActionClick(event, 'approve', request.id)
      });
   }

   return (<Button.Group buttons={buttons} />);
}

export default RequestActions;