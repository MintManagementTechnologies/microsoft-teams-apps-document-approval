import RequestsList from 'features/requests/RequestsList';
import { useTranslation } from 'react-i18next';
import { RootState, useTypedSelector } from 'store';

// import { IRequestModel } from '@common/types/request';
import { Flex, Text } from '@fluentui/react-northstar';

import { IRequestModel } from '../../../features/requests/request';
import { useGetAllApprovedRequestsQuery } from '../../../features/requests/requestService';
import Loader from '../../common/Loader';
import HeaderRow from './HeaderRow';

const ApprovedRequestsList = (): JSX.Element => {
   const { t, i18n } = useTranslation();
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);

   const { data, isLoading: isLoadingGetAllApprovedRequests, isFetching: isFetchingGetAllApprovedRequests } = useGetAllApprovedRequestsQuery();
   let allItems: IRequestModel[] = data || [];

   const isLoading = isLoadingGetAllApprovedRequests || isFetchingGetAllApprovedRequests;
   return (
      <Flex fill column>
         {currentUser.personaTypes.includes('approvalcustodian') ?
            (isLoading || !allItems) ? <Loader message={t('common:entity.request', { count: 0 })} />
               :
               (allItems.length > 0 ?
                  <RequestsList items={allItems} headerTableRow={<HeaderRow />} persona='approvalCustodian' />
                  :
                  <Flex fill hAlign='center' padding='padding.medium'>
                     <Text content={t('common:error.noItems', { entity: `${t('common:entity.request', { count: 0 })}` })} size='large' weight={'semibold'} />
                  </Flex>
               )
            :
            <Flex fill hAlign='center' padding='padding.medium'>
               <Text content={t('common:error.accessDenied')} size='large' weight={'semibold'} error />
            </Flex>
         }

      </Flex>
   );
}

export default ApprovedRequestsList;