import './DashboardTab.scss';

import { getRouteParams } from 'common/utils/helpers/urlHelpers';
import Loader from 'components/common/Loader';
import AllRequestsList from 'components/requestLists/allRequests/AllRequestsList';
import ApprovedRequestsList from 'components/requestLists/approvedRequests/ApprovedRequestsList';
import MyRequestsList from 'components/requestLists/myRequests/MyRequestsList';
import { useGetUserQuery } from 'features/users/userService';
import { userPersonaTypesChanged } from 'features/users/userSlice';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetNewRefNumberQuery } from 'services/configService';
import { RootState, useAppDispatch, useTypedSelector } from 'store';

import { Button, Flex } from '@fluentui/react-northstar';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import RequestsList from '../../features/requests/RequestsList';

const DashboardTab = (): JSX.Element => {
   const { userScope } = getRouteParams(window.location.hash);
   const { t, i18n } = useTranslation();
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   const dispatch = useAppDispatch();

   const { data, isLoading: isLoadingGetUser, isFetching: isFetchingGetUser } = useGetUserQuery(currentUser.id || skipToken);

   useEffect(() => {
      if (!data) return;
      dispatch(userPersonaTypesChanged({ personaTypes: data.personaTypes }));
   }, [data]);

   const isLoading = isFetchingGetUser || isLoadingGetUser;
   return (
      <>
         <Flex>
            {isLoading ? <Loader message={t('common:entity.request', { count: 0 })} />
               : <>
                  {userScope === 'admin' ?
                     <ApprovedRequestsList />
                     : currentUser.personaTypes.includes('dgsupport') ?
                        <AllRequestsList />
                        :
                        <MyRequestsList currentUserUPN={currentUser.upn} />
                  }
               </>
            }
         </Flex>
      </>
   );
}

export default DashboardTab;