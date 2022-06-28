import './Modal.scss';

import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import User from 'features/users/User';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import SPconfigForm from 'views/modals/config/SPconfigForm';
import TeamConfigForm from 'views/modals/config/TeamConfigForm';

// import { getRouteParams } from '~helpers/urlHelpers';
import { Flex } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';

import ErrorMessage from '../../../components/common/ErrorMessage';
import ApprovalWrapper from '../../modals/request/ApprovalWrapper';
import EditActorsWrapper from '../../modals/request/EditActorsWrapper';
import EditRequestWrapper from '../../modals/request/EditRequestWrapper';
import NewRequestWrapper from '../../modals/request/NewRequestWrapper';
import EditUserWrapper from '../../modals/user/EditUserWrapper';
import { getDimensions } from './modalDimensions';

const ModalContainer = (): JSX.Element => {
   const { t } = useTranslation();
   const { userScope, view, id } = getRouteParams(window.location.hash);
   const { action } = useParams<{ action: string }>();

   let newSize = getDimensions(view, action);
   microsoftTeams.tasks.updateTask(newSize);
   const itemId = id || 'notFound';

   const renderView = () => {
      if (userScope === 'admin' && view === 'config') {
         if (action === 'site') {
            return <SPconfigForm docType={itemId} />
         }
         else {
            return <TeamConfigForm docType={itemId} />
         }
      }
      if (view === 'users')
         return <EditUserWrapper />
      switch (action) {
         case 'new':
            return <NewRequestWrapper />;
         case 'edit':
            return <EditRequestWrapper />;
         case 'view':
            return <EditRequestWrapper />;
         case 'approve':
            return <ApprovalWrapper />;
         case 'editactors':
            return <EditActorsWrapper />;
         default:
            return <ErrorMessage message={t('error.modal.action')} messageDetails={`Could not find the action ${action} in for the ModalContainer`} />;
      }
   }

   return (
      <Flex
         className={`mmt-taskModule mmt-${view}-${action}`}
         gap="gap.medium"
         padding="padding.medium"
         column
      >
         {itemId === 'notFound' ?
            <ErrorMessage message={t('error.modal.action')} messageDetails={`No Item ID found in the ModalContainer for ${view}.`} />
            : renderView()
         }
      </Flex>
   );
}

export default ModalContainer;