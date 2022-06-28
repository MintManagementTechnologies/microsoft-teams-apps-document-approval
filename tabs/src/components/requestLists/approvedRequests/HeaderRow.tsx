import { useTranslation } from 'react-i18next';

import { TableRow } from '@fluentui/react-northstar';

const HeaderRow = (): JSX.Element => {
   const { t, i18n } = useTranslation();
   const header = {
      className: 'mmt-header',
      key: 'browseRequests-header',
      items: [
         {
            className: 'd-none d-md-flex',
            content: t('common:header.refNumber'),
            key: 'browseRequests-h-refNumber',
            styles: {
               maxWidth: '150px'
            }
         },
         {
            className: 'd-none d-lg-flex',
            content: t('common:header.created'),
            key: 'browseRequests-h-created',
            styles: {
               maxWidth: '150px',
            }
         },
         {
            content: t('common:header.title'),
            key: 'browseRequests-h-title',
            styles: {
               maxWidth: '250px',
            }
         },
         {
            className: 'd-none d-md-flex',
            content: t('common:header.createdBy'),
            key: 'browseRequests-h-createdBy',
            styles: {
               maxWidth: '220px',
            }
         },
         {
            className: 'd-none d-sm-flex',
            content: t('common:header.assignedTo'),
            key: 'browseRequests-h-assignedTo',
            styles: {
               maxWidth: '220px',
            }
         },
         {
            content: t('common:header.viewOrAction'),
            key: 'browseRequests-h-actions',
            styles: {
               maxWidth: '150px',
            }
         },
      ],
   }

   return (
      <TableRow header className='mmt-table-header' items={header.items} />
   )
}

export default HeaderRow;