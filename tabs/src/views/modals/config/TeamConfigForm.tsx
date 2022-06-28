import Loader from 'components/common/Loader';
import {
    useCreateTeamConfigMutation, useGetAllMySitesQuery, useGetSiteConfigQuery,
    useGetTeamConfigQuery, useLazyGetDriveFoldersQuery, useLazyGetSiteDrivesQuery
} from 'features/config/configService';
import { ISiteModel, ITeamConfigModel } from 'features/config/types';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
    useGetTeamDropdownOptionsQuery, useLazyGetChannelDropdownOptionsQuery
} from 'services/msGraphApiService';

import {
    Button, Dropdown, Flex, FormLabel, Input, Loader as FluentLoader, Segment, Text
} from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { skipToken } from '@reduxjs/toolkit/dist/query';

const TeamConfigForm = (props: { docType: string }): JSX.Element => {
   const { docType } = props;
   const { t } = useTranslation();
   // const [teamDropdownOptions, setTeamDropdownOptions] = useState<{ header: string, key: string }[]>([]);
   // const [channelDropdownOptions, setChannelDropdownOptions] = useState<{ header: string, key: string }[]>([]);

   const [teamId, setTeamId] = useState('');
   const [teamName, setTeamName] = useState('');
   const [channelId, setChannelId] = useState('');
   const [channelName, setChannelName] = useState('');

   const { data: dataGetTeamConfig, isFetching: isFetchingGetTeamConfig, isLoading: isLoadingGetTeamConfig }
      = useGetTeamConfigQuery(docType || skipToken);
   const { data: teamDropdownOptions, isFetching: isFetchingGetTeamDropdownOptions, isLoading: isLoadingGetTeamDropdownOptions }
      = useGetTeamDropdownOptionsQuery();
   const [triggerGetChannelDropdownOptions,
      {
         data: channelDropdownOptions,
         isLoading: isLoadingGetChannelDropdownOptions,
         isFetching: isFetchingGetChannelDropdownOptions,
      }] = useLazyGetChannelDropdownOptionsQuery();
   const [createTeamConfig, { isLoading: isLoadingCreateTeamConfig, isError: isErrorCreateTeamConfig }] = useCreateTeamConfigMutation();



   useEffect(() => {
      if (!(dataGetTeamConfig && teamDropdownOptions)) return;
      setTeamId(dataGetTeamConfig.teamId);
      setTeamName(dataGetTeamConfig.teamName);
      setChannelId(dataGetTeamConfig.channelId);
      setChannelName(dataGetTeamConfig.channelName);
   }, [dataGetTeamConfig, teamDropdownOptions]);

   useEffect(() => {
      if (!teamId) return;
      triggerGetChannelDropdownOptions(teamId);
   }, [teamId]);

   const handleTeamChange = (_event: any, _value: any) => {
      if (_event !== null) _event.preventDefault();
      setChannelName('');
      setChannelId('');
      if (!_value) {
         setTeamName('');
         setTeamId('');
         return;
      }
      setTeamName(_value.header);
      setTeamId(_value.key);
   }

   const handleChannelChange = (_event: any, _value: any) => {
      if (_event !== null) _event.preventDefault();
      if (!_value) {
         setChannelName('');
         setChannelId('');
         return;
      }
      setChannelName(_value.header);
      setChannelId(_value.key);
   }

   const handleOnSubmit = async (_event: any) => {
      if (_event !== null) _event.preventDefault();
      const teamConfig: ITeamConfigModel = {
         id: docType,
         configType: 'teamConfig',
         teamName: teamName,
         channelName: channelName,
         teamId: teamId,
         channelId: channelId,
      }
      createTeamConfig(teamConfig).unwrap().then((result) => {
         microsoftTeams.tasks.submitTask("refresh");
      });
   }

   const isLoading = isLoadingGetTeamDropdownOptions || isFetchingGetTeamDropdownOptions || isFetchingGetTeamConfig || isLoadingGetTeamConfig;
   const isLoadingChannels = isLoadingGetChannelDropdownOptions || isFetchingGetChannelDropdownOptions;
   return (
      <Flex gap="gap.medium" column fill className={`mmt-form-container`} padding="padding.medium">
         <Flex className={`mmt-taskModule-body`} >
            {isLoading ? <Loader message={t('common:entity.config')} /> :
               <Flex column fill>
                  <Row className="mmt-form-team">
                     <Col key={`col-form-team-picker`} className={`mmt-team-col`}  >
                        <Flex column fill className={`mmt-inputGroup mmt-dropdown-team`}>
                           <FormLabel content={`My Teams`} />
                           {(teamDropdownOptions && teamDropdownOptions.length > 0) &&
                              <Dropdown
                                 onChange={(event, { value }) => handleTeamChange(event, value)}
                                 placeholder={`My Joined Teams`}
                                 items={teamDropdownOptions}
                                 defaultValue={teamDropdownOptions.find(x => x.key === dataGetTeamConfig?.teamId)}
                                 defaultSearchQuery={dataGetTeamConfig?.teamName}
                                 fluid
                                 search
                              />
                           }
                        </Flex>
                     </Col>
                  </Row>
                  <Row className="mmt-form-channel">
                     <Col key={`col-form-channel`} className={`mmt-channel-col`} >
                        <Flex column fill className={`mmt-inputGroup mmt-input-channel`}>
                           <FormLabel content={`Channel`} />
                           {isLoadingChannels && <FluentLoader />}
                           {(!isLoadingChannels && channelDropdownOptions && channelDropdownOptions.length > 0) ?
                              <Dropdown
                                 disabled={!teamId}
                                 onChange={(event, { value }) => handleChannelChange(event, value)}
                                 placeholder={`Select...`}
                                 items={channelDropdownOptions}
                                 defaultValue={channelDropdownOptions.find(x => x.key === channelId)}
                                 fluid
                              />
                              :
                              <>{!isLoadingChannels && <Input fluid disabled value={'No Channels found.'} />}</>
                           }
                        </Flex>
                     </Col>
                  </Row>
                  <Segment className={"mmt-footer-container"}>
                     <Flex fill hAlign="end" gap="gap.small">
                        <Button
                           content={t('common:button.cancel')}
                           onClick={() => microsoftTeams.tasks.submitTask("cancel")}
                        />
                        <Button
                           content={t(`common:button.save`)}
                           primary
                           onClick={(event) => handleOnSubmit(event)}
                           disabled={!(teamId && channelId) || isLoadingCreateTeamConfig}
                           loading={isLoadingCreateTeamConfig}
                        />
                     </Flex>
                  </Segment>
               </Flex>
            }
         </Flex>
      </Flex>
   )
}

export default TeamConfigForm;