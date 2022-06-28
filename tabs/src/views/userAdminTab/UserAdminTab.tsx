import './UserAdminTab.scss';

import { getBaseUrl } from 'common/utils/helpers/urlHelpers';

// import { useTranslation } from 'react-i18next';
// import { upperFirstLetter } from '~helpers/stringHelpers';
// import { getBaseUrl } from '~helpers/urlHelpers';
import { Flex } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';

import UsersList from '../../features/users/UsersList';

const UserAdminTab = (): JSX.Element => {
   // const { t, i18n } = useTranslation();

   const submitHandler = (err: any, result: any) => {
      //alert(result);
   };

   const handleOnClick = (_event: any, _action: string, _id: string) => {
      const taskInfo = {
         url: getBaseUrl() + `/admin/users/${_action}/${_id}`,
         title: `${_action.upperFirstLetter()} Request`,
         height: 700,
         width: 1200,
      };
      microsoftTeams.tasks.startTask(taskInfo, submitHandler);
   }



   return (
      <>
         <Flex hAlign='center' fill>
            <UsersList />
         </Flex>
      </>
   );
}

export default UserAdminTab;