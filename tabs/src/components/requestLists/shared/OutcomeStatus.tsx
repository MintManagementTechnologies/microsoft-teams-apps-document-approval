import * as React from 'react';
import { Text } from "@fluentui/react-northstar";

const OutcomeStatus = (props: { status: string, outcome: string }): JSX.Element => {
   const { status, outcome } = props;
   
   let statusColor = 'orange';
   let statusContent = '';
   let outcomeStatus = outcome || 'pending';
   switch (outcomeStatus) {
      case 'approved':
         statusContent = `Approved`;
         statusColor = 'green';
         break;
      case 'rejected':
         statusContent = `Rejected`
         statusColor = 'red';
         break;
      case 'withdrawn':
         statusContent = `Withdrawn`
         statusColor = 'grey';
         break;
      default:
         statusContent = `Under Review`
         break;
   }
   return <Text content={statusContent} color={statusColor} />
}

export default OutcomeStatus;