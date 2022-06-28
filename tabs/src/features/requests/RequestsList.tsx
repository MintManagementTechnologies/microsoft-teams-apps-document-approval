import './RequestsList.scss';

import { differenceInDays } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

// import { IRequestModel } from '@common/types/request';
import { Flex, Table, TableRow, Text } from '@fluentui/react-northstar';
import { createSelector } from '@reduxjs/toolkit';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import Loader from '../../components/common/Loader';
import AllRequestsRow from '../../components/requestLists/allRequests/RequestRow';
import ApprovedRequestsRow from '../../components/requestLists/approvedRequests/RequestRow';
import MyRequestsRow from '../../components/requestLists/myRequests/RequestRow';
import { RootState, useTypedSelector } from '../../store';
import { selectDashboard } from '../filters/dashboardToggle/dashboardToggleSlice';
import { IRequestModel } from './request';
import { useGetRequestsByActorQuery } from './requestService';

export interface IHeader {
   key: string;
   items: {
      content: string;
      key: string;
   }[];
}

export interface ICell {
   content: string | JSX.Element;
   key: string;
   truncateContent?: boolean;
}

export interface IRow {
   key: string;
   items: ICell[];
}
const RequestsList = (props: { persona: string, items: IRequestModel[], headerTableRow: React.ReactNode }): JSX.Element => {
   const { persona, items, headerTableRow } = props;
   const { t, i18n } = useTranslation();
   const dashboardView = useSelector(selectDashboard);
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);

   const searchQuery = useTypedSelector((state: RootState) => state.search);
   const selectedFilters = useTypedSelector((state: RootState) => state.filters);
   const selectFilterResults = useMemo(() => {
      // Return a unique selector instance for this page so that
      // the filtered results are correctly memoized
      return createSelector(
         (res: any) => res.data,
         (data) => {
            let dataResult = data ? data as IRequestModel[] : undefined;
            let totalFilters = 0;
            selectedFilters.map(x => x.value).forEach(x => totalFilters += x.length);
            if (dataResult && totalFilters > 0) {
               selectedFilters.forEach(x => {
                  if (x.value.length === 0) return;
                  if (x.field === 'status') {
                     dataResult = dataResult?.filter(y => x.value.includes(y.outcome))
                  } else if (x.field === 'modifiedTimestamp') {
                     let nowDate = new Date().getTime();
                     // let nowDate = new Date().toDateString();
                     if (x.value.includes(`2`)) {
                        dataResult = dataResult?.filter(y => differenceInDays(nowDate, y.modifiedTimestamp) >= 2)
                        // dataResult = dataResult?.filter(y => differenceInDays(new Date(nowDate), new Date(new Date(y.modifiedTimestamp).toDateString())) > 1)
                     }
                     if (x.value.includes(`3`)) {
                        dataResult = dataResult?.filter(y => differenceInDays(nowDate, y.modifiedTimestamp) >= 3)
                        // dataResult = dataResult?.filter(y => differenceInDays(new Date(nowDate), new Date(new Date(y.modifiedTimestamp).toDateString())) >= 3)
                     }
                  } else if (x.field === 'currentApproversUPN') {
                     if (x.value.includes('currentApprover')) {
                        dataResult = dataResult?.filter(y => y.currentApproversUPN.includes(currentUser.upn))
                     }
                  }
               })
            }
            if (dataResult && dashboardView === 'approvals') {
               dataResult = dataResult.filter(y => y.currentApproversUPN.includes(currentUser.upn) || y.prevApproversUPN.includes(currentUser.upn))
            } else if (dataResult && dashboardView === 'requests') {
               dataResult = dataResult.filter(y => y.createdByUPN === currentUser.upn)
            }
            return dataResult ?
               dataResult.filter((x: IRequestModel) => x.title.toLowerCase().includes(searchQuery))
               : undefined
         }
      )
   }, [selectedFilters, searchQuery, dashboardView]);

   const filteredData = useSelector((state) => selectFilterResults({ data: items }));
   let allItems: IRequestModel[] = filteredData ? filteredData.sort((x: IRequestModel) => x.modifiedTimestamp) : [];

   return (
      <Flex fill column>
         {(allItems.length > 0 ?
            <Table
               className={`mmt-table`}
               compact
               variables={{ cellContentOverflow: 'none' }}
               aria-label='Nested navigation'
            >
               {headerTableRow}
               {persona === 'user' &&
                  allItems.map(x => <MyRequestsRow request={x} key={`${persona}-refNumber-${x.refNumber}-${x.id}`} />)
               }
               {persona === 'dgSupport' &&
                  allItems.map(x => <AllRequestsRow request={x} key={`${persona}-refNumber-${x.refNumber}-${x.id}`} />)
               }
               {persona === 'approvalCustodian' &&
                  allItems.map(x => <ApprovedRequestsRow request={x} key={`${persona}-refNumber-${x.refNumber}-${x.id}`} />)
               }
            </Table>
            :
            <Flex fill hAlign='center' padding='padding.medium'>
               <Text content={t('common:error.noItems', { entity: t('common:entity.request', { count: 0 }) })} size='large' weight={'semibold'} />
            </Flex>
         )}
      </Flex>
   );
}

export default RequestsList;