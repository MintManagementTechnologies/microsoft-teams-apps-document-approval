import * as React from 'react';
import { Flex, Loader } from '@fluentui/react-northstar';
import { useTranslation } from 'react-i18next';

const LoaderHOC = (props: { message?: string }): JSX.Element => {
   const { t } = useTranslation();
   const { message } = props;
   const entity = message || '';
   return (
      <Flex hAlign='center' fill>
         <Loader label={t('common:loading', {entity: entity})} />
      </Flex>
   );
}

export default LoaderHOC;