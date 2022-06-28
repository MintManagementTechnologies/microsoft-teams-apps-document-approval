import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';

import { Alert, ExclamationCircleIcon, Flex, Text } from '@fluentui/react-northstar';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import Loader from '../../../components/common/Loader';
import FileList from '../FileList';
import { useGetDocTypeTemplatesQuery } from '../fileService';

const DocTemplate = (props: { docType: string }): JSX.Element => {
   const { docType } = props;
   const { t } = useTranslation();
   const { data: dataGetDocTemplates, isLoading: isLoadingGetDocTemplate, isFetching: isFetchingGetDocTemplate } = useGetDocTypeTemplatesQuery(docType || skipToken);
   const allDocTemplates = dataGetDocTemplates || [];
   const mainDocTemplate = allDocTemplates.length > 0 ? allDocTemplates[0] : undefined;

   const isLoading = isLoadingGetDocTemplate || isFetchingGetDocTemplate;
   return (
      <Flex gap="gap.small" column>
         <Text content={t('common:entity.template', { count: 0 })} weight={'semibold'} size={"large"} />
         {isLoading ? <Loader message={t('common:entity.template', { count: 0 })} />
            : <FileList uploadTrigger={"onAdd"} files={mainDocTemplate ? [mainDocTemplate] : []} />
         }
         <Alert content={t('message.useTemplate')} icon={<ExclamationCircleIcon outline />} className={`mmt-message mmt-template`} />
      </Flex>
   );
}

export default DocTemplate;