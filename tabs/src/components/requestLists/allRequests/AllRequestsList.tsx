import RequestsList from 'features/requests/RequestsList';
import { useTranslation } from 'react-i18next';

// import { IRequestModel } from '@common/types/request';
import { Flex, Text } from '@fluentui/react-northstar';

import { IRequestModel } from '../../../features/requests/request';
import { useGetAllRequestsQuery } from '../../../features/requests/requestService';
import Loader from '../../common/Loader';
import HeaderRow from './HeaderRow';

const AllRequestsList = (): JSX.Element => {
   const { t, i18n } = useTranslation();
   
   const { data, isLoading: isLoadingGetAllRequests, isFetching: isFetchingGetAllRequests } = useGetAllRequestsQuery();
   let allItems: IRequestModel[] = data || [];

   const isLoading = isLoadingGetAllRequests || isFetchingGetAllRequests;
   return (
      <Flex fill column>
         {(isLoading || !allItems) ? <Loader message={t('common:entity.request', { count: 0 })} />
            :
            (allItems.length > 0 ?
               <RequestsList items={allItems} headerTableRow={<HeaderRow/>} persona='dgSupport' />
               :
               <Flex fill hAlign='center' padding='padding.medium'>
                  <Text content={t('common:error.noItems', { entity: t('common:entity.request', { count: 0 }) })} size='large' weight={'semibold'} />
               </Flex>
            )
         }
      </Flex>
   );
}

export default AllRequestsList;