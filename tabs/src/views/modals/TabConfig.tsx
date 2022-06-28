import '../shared/modals/Modal.scss';

import Loader from 'components/common/Loader';
import { useGetTeamConfigQuery } from 'features/config/configService';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState, useTypedSelector } from 'store';
import { v4 as uuid } from 'uuid';

import { Alert, ExclamationTriangleIcon, Flex, Header, Text } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { skipToken } from '@reduxjs/toolkit/dist/query';

const TabConfig = (): JSX.Element => {
   const { t } = useTranslation();
   const baseUrl = `https://${window.location.hostname}:${window.location.port}/index.html#`;
   const [contentUrl, setContentUrl] = useState(baseUrl + "/admin/dashboard/browse/1");
   const [tabName, setTabName] = useState("Approved Memos");
   const [isLoadingContext, setIsLoadingContext] = useState(true);
   const [teamId, setTeamId] = useState('');
   const [channelId, setChannelId] = useState('');
   const [configTeamId, setConfigTeamId] = useState('');
   const [configChannelId, setConfigChannelId] = useState('');
   const [isValid, setIsValid] = useState(false);


   const { data: dataGetTeamConfig, isFetching: isFetchingGetTeamConfig, isLoading: isLoadingGetTeamConfig }
      = useGetTeamConfigQuery('memo');

   const selectedCurrentUser = useTypedSelector((state: RootState) => state.currentUser);

   useEffect(() => {
      microsoftTeams.settings.setValidityState(false);
   }, [])

   useEffect(() => {
      if (!dataGetTeamConfig) return;
      setConfigTeamId(dataGetTeamConfig.teamId);
      setConfigChannelId(dataGetTeamConfig.channelId);
   }, [dataGetTeamConfig])

   useEffect(() => {
      if (!(teamId && channelId && configTeamId && configChannelId)) return;
      const teamIsValid = teamId === configTeamId;
      const channelIsValid = channelId === configChannelId;
      setIsValid(teamIsValid && channelIsValid);
      microsoftTeams.settings.setValidityState(teamIsValid && channelIsValid);
   }, [teamId, channelId, configTeamId, configChannelId])

   // Initialize the Microsoft Teams SDK
   microsoftTeams.initialize();
   microsoftTeams.getContext((context: microsoftTeams.Context) => {
      const ctxTeamId = context.groupId;
      const ctxChannelId = context.channelId;
      if (ctxTeamId && ctxChannelId) {
         setTeamId(ctxTeamId);
         setChannelId(ctxChannelId);
      }
      setIsLoadingContext(false);
   });
   microsoftTeams.settings.registerOnSaveHandler((saveEvent) => {
      microsoftTeams.settings.setSettings({
         suggestedDisplayName: tabName,
         entityId: uuid(),
         contentUrl: contentUrl,
      });
      saveEvent.notifySuccess();
   });

   // const isLoadingModal = selectedCurrentEmployee.id === 0;
   // const isLoadingAppraisalPeriod = isFetchingGetCurrentAppraisalPeriod || isLoadingGetCurrentAppraisalPeriod || !dataGetCurrentAppraisalPeriod;
   const isLoading = isLoadingContext || isLoadingGetTeamConfig || isFetchingGetTeamConfig;
   const noConfigFound = !(configTeamId && configChannelId);
   return (
      <Flex
         className={`mmt-taskModule mmt-tabConfig`}
         gap="gap.medium"
         padding="padding.medium"
         column
         fill
      >
         {isLoading ? <Loader message={t('common:entity.setting', { count: 0 })} /> :
            <>
               {isValid ? <Flex fill hAlign="center" vAlign="center"><Header as={"h4"} content={'Click save to continue.'} /></Flex> :
                  <>
                     {noConfigFound &&
                        <Flex column hAlign="center" vAlign="center" gap="gap.small">
                           <Alert icon={<ExclamationTriangleIcon />}
                              danger
                              className="mmt-tabConfig-errorMessage"
                              content={'Team configuration required!'}
                           />
                           <Text content={'Please contact an administrator to first configure the records management team.'} />
                        </Flex>
                     }
                     {!noConfigFound &&
                        <Flex column hAlign="center" vAlign="center" gap="gap.small">
                           <Flex fill column gap="gap.small">
                              <Alert icon={<ExclamationTriangleIcon />}
                                 danger
                                 className="mmt-tabConfig-errorMessage"
                                 content={'Incorrect Team!'}
                              />
                              <Text content={'This team/channel is not configured as the records management team.'} />
                           </Flex>
                           <br />
                           <Flex fill column gap="gap.medium">
                              <Flex fill gap="gap.small" vAlign="center">
                                 <Text content='Configured Team:' weight={'semibold'} className={`mmt-config-label`} />
                                 <Text content={dataGetTeamConfig?.teamName} />
                              </Flex>
                              <Flex fill gap="gap.small" vAlign="center">
                                 <Text content='Configured Channel:' weight={'semibold'} className={`mmt-config-label`} />
                                 <Text content={dataGetTeamConfig?.channelName} />
                              </Flex>
                           </Flex>
                        </Flex>
                     }
                  </>
               }
            </>
         }
      </Flex>
   );
}

export default TabConfig;