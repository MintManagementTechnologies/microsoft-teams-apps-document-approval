import { daysOverdueLimit } from 'common/utils/envVariables';
import { getLocaleDate } from 'common/utils/helpers/localeHelpers';
import { differenceInDays, formatDistance } from 'date-fns';

import { gridCellWithFocusableElementBehavior, TableRow, Text } from '@fluentui/react-northstar';

import { IRequestModel } from '../../../features/requests/request';
import UserPill from '../../common/userPill/UserPill';
import OutcomeStatus from '../shared/OutcomeStatus';
import RequestActions from './RequestActions';

const RequestRow = (props: { request: IRequestModel }): JSX.Element => {
   const { request } = props;

   const getLastModifiedDate = (_modifiedTimestamp: number) => {
      // let nowDate = new Date().toDateString();
      // let modifiedDate = new Date(_modifiedTimestamp).toDateString();
      // const lastModifiedDays = differenceInDays(new Date(nowDate), new Date(modifiedDate));
      // const lastModified = formatDistance(new Date(_modifiedTimestamp), new Date(), { addSuffix: true });
      let nowDate = new Date().getTime();
      let modifiedDate = _modifiedTimestamp;
      const lastModifiedDays = differenceInDays(nowDate, modifiedDate);
      const lastModified = formatDistance(_modifiedTimestamp, nowDate, { addSuffix: true });
      let statusColor = lastModifiedDays >= daysOverdueLimit ? 'red' : 'none';
      let fontWeight = lastModifiedDays >= daysOverdueLimit ? 'semibold' : 'regular';

      return <Text content={lastModified.upperFirstLetter()} color={statusColor} weight={fontWeight as ('semibold' | 'regular')} />
   }
   
   const cellItems = [
      {
         className: 'd-none d-md-flex',
         content: request.refNumber,
         key: `col-lvl-refNumber-${request.id}`,
         styles: {
            maxWidth: '150px'
         }
      },
      {
         className: 'd-none d-lg-flex',
         content: getLocaleDate(request.createdTimestamp, 'dd MMMM yyyy'),
         truncateContent: true,
         key: `col-createdTimestamp-index-${request.id}`,
         styles: {
            maxWidth: '150px',
         }
      },
      {
         className: 'd-none d-md-flex',
         content: getLastModifiedDate(request.modifiedTimestamp),
         key: `col-modifiedTimestamp-index-${request.id}`,
         styles: {
            maxWidth: '170px',
         }
      },
      {
         content: request.title,
         truncateContent: true,
         key: `col-title-index-${request.id}`,
         styles: {
            maxWidth: '250px',
         }
      },
      {
         content: <OutcomeStatus outcome={request.outcome} status={request.status} />,
         truncateContent: true,
         key: `col-status-index-${request.id}`,
         styles: {
            maxWidth: '200px',
         }
      },
      {
         className: 'd-none d-md-flex',
         content: <UserPill userId={request.createdById} disabled size="small" />,
         truncateContent: true,
         key: `col-createdByDisplayName-index-${request.id}`,
         styles: {
            maxWidth: '220px',
         }
      },
      {
         className: 'd-none d-sm-flex',
         content: request.currentApproversUPN.length > 0 ? <UserPill userId={request.currentApproversUPN[0]} disabled size="small" /> : <Text content={'NA'} />,
         truncateContent: true,
         key: `col-currentApprover-index-${request.id}`,
         styles: {
            maxWidth: '220px',
         }
      },
      {
         content: <RequestActions request={request} />,
         key: `col-actions-index-${request.id}`,
         styles: {
            maxWidth: '150px',
         },
         accessibility: gridCellWithFocusableElementBehavior,
         onClick: (e: any) => {
            e.stopPropagation()
         }
      },
   ]

   return <TableRow className='mmt-table-row' items={cellItems} />;
}

export default RequestRow;