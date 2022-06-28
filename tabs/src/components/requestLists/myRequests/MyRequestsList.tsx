import RequestsList from 'features/requests/RequestsList';
import { useTranslation } from 'react-i18next';

// import { IRequestModel } from '@common/types/request';
import { Flex, Text } from '@fluentui/react-northstar';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import { IRequestModel } from '../../../features/requests/request';
import { useGetRequestsByActorQuery } from '../../../features/requests/requestService';
import Loader from '../../common/Loader';
import HeaderRow from './HeaderRow';

const MyRequestsList = (props: {currentUserUPN: string}): JSX.Element => {
   const { currentUserUPN } = props;
   const { t, i18n } = useTranslation();
   
   const { data, isLoading: isLoadingGetRequestsByActor, isFetching: isFetchingGetRequestsByActor } = useGetRequestsByActorQuery(currentUserUPN || skipToken)
   let allItems: IRequestModel[] = data || [];

   const isLoading = isLoadingGetRequestsByActor || isFetchingGetRequestsByActor;
   return (
      <Flex fill column>
         {(isLoading || !allItems) ? <Loader message={t('common:entity.request', { count: 0 })} />
            :
            (allItems.length > 0 ?
               <RequestsList items={allItems} headerTableRow={<HeaderRow/>} persona='user' />
               :
               <Flex fill hAlign='center' padding='padding.medium'>
                  <Text content={t('common:error.noItems', { entity: t('common:entity.request', { count: 0 }) })} size='large' weight={'semibold'} />
               </Flex>
            )
         }
      </Flex>
   );
}

export default MyRequestsList;