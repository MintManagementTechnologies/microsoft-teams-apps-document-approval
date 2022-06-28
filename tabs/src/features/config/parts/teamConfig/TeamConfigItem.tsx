import './TeamConfig.scss';

import { getBaseUrl } from 'common/utils/helpers/urlHelpers';
import { ITeamConfigModel } from 'features/config/types';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RootState, useTypedSelector } from 'store';

import { Button, Divider, Flex, Text } from '@fluentui/react-northstar';

const TeamConfigItem = (props: { item: ITeamConfigModel }): JSX.Element => {
   const { item } = props;
   const { t, i18n } = useTranslation();

   return (
      <Flex fill column gap="gap.medium">
         <Flex fill gap="gap.small" vAlign="center">
            <Text content='Team:' weight={'semibold'} className={`mmt-config-label`} />
            <Text content={item.teamName} />
         </Flex>
         <Flex fill gap="gap.small" vAlign="center">
            <Text content='Channel:' weight={'semibold'} className={`mmt-config-label`} />
            <Text content={item.channelName} />
         </Flex>
      </Flex>
   );
}

export default TeamConfigItem;