import './SiteConfig.scss';

import { getBaseUrl } from 'common/utils/helpers/urlHelpers';
import { ISiteConfigModel } from 'features/config/types';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RootState, useTypedSelector } from 'store';

import { Button, Divider, Flex, Text } from '@fluentui/react-northstar';

const SiteConfigItem = (props: { item: ISiteConfigModel }): JSX.Element => {
   const { item } = props;
   const { t, i18n } = useTranslation();

   return (
      <Flex fill column gap="gap.medium">
         <Flex fill gap="gap.small" vAlign="center">
            <Text content='Site:' weight={'semibold'} className={`mmt-config-label`} />
            <Button
               text
               as={"a"}
               target="_blank"
               className={`mmt-config-value-button`}
               content={item.title}
               href={item.url}
            />
         </Flex>
         <Flex fill gap="gap.small" vAlign="center">
            <Text content='Document Library:' weight={'semibold'} className={`mmt-config-label`} />
            <Button
               text
               as={"a"}
               target="_blank"
               className={`mmt-config-value-button`}
               content={item.docLibName}
               href={`${item.url}/${item.docLibName}`}
            />
         </Flex>
         <Flex fill gap="gap.small" vAlign="center">
            <Text content='Template Folder:' weight={'semibold'} className={`mmt-config-label`} />
            <Button
               text
               as={"a"}
               className={`mmt-config-value-button`}
               target="_blank"
               content={item.templateFolderName}
               href={`${item.url}/${item.docLibName}/${item.templateFolderName}`}
            />
         </Flex>
      </Flex>
   );
}

export default SiteConfigItem;