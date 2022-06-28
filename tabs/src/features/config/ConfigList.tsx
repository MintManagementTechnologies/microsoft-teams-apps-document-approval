import './ConfigList.scss';

import { getBaseUrl } from 'common/utils/helpers/urlHelpers';
import TaskModuleButton from 'components/common/buttons/TaskModuleButton';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RootState, useTypedSelector } from 'store';

import {
    Alert, Divider, ExclamationTriangleIcon, Flex, FlexItem, Segment, Text
} from '@fluentui/react-northstar';

import { useGetAllConfigQuery } from './configService';
import SiteConfigItem from './parts/siteConfig/SiteConfigItem';
import TeamConfigItem from './parts/teamConfig/TeamConfigItem';

const ConfigList = (props: { docType: string }): JSX.Element => {
   const { docType } = props;
   const { t, i18n } = useTranslation();
   const selectedDocTypeConfigList = useTypedSelector((state: RootState) => state.config.list.find(x => x.docType === docType));


   const { refetch } = useGetAllConfigQuery();

   useEffect(() => {
      if (!selectedDocTypeConfigList) return;
      //trigger(allUserUPNs);
   }, [selectedDocTypeConfigList]);

   const handleOnCallback = (_result: any) => {
      if (_result === "refresh") {
         refetch();
      } else {
         console.log("DONT REFRESH");
      }
   }

   //    const taskInfo = {
   //       url: getBaseUrl() + `/me/users/${_action}/${_id}`,
   //       title: `${t(`taskModule.title.${_action}User`)}`,
   //       height: 400,
   //       width: 400,
   //    };
   //    microsoftTeams.tasks.startTask(taskInfo, submitHandler);
   // }

   // const isLoading = isLoadingGetUsersByUser || isFetchingGetUsersByUser || result.isLoading || result.isFetching;
   return (
      <Flex fill gap="gap.large" className="mmt-configList">
         {selectedDocTypeConfigList &&
            <Flex fill gap="gap.large">
               <FlexItem size='size.half'>
                  <Segment color="brand">
                     <Flex column>
                        {/* <Divider important content="SharePoint Site Configuration" size={1} color={'brand'} /> */}
                        <Flex gap="gap.medium" vAlign="center">
                           <Text content="SharePoint Site Configuration" size="large" weight={'semibold'} className={`mmt-config-label`} />
                           <TaskModuleButton callback={handleOnCallback} primary title="Site Configuration" path={`admin/config/site/${docType}`} content="Update Site Config" />
                        </Flex>
                        <br />
                        {selectedDocTypeConfigList.spConfig.length === 0 &&
                           <Flex>
                              <Alert icon={<ExclamationTriangleIcon />}
                                 danger
                                 fitted
                                 content={'Site configuration required!'}
                              />
                           </Flex>
                        }
                        {selectedDocTypeConfigList.spConfig.map((x, xIndex) =>
                           <Flex fill key={`configItem-${xIndex}`} gap="gap.small">
                              <SiteConfigItem item={x} />
                           </Flex>
                        )}
                     </Flex>
                  </Segment>
               </FlexItem>
               {/* <Divider vertical size={2} /> */}
               <FlexItem size='size.half'>
                  <Segment color="brand">
                     <Flex column>
                        {/* <Divider important content="Team Configuration" size={1} color={'brand'} /> */}
                        <Flex gap="gap.small" vAlign="center">
                           <Text content="Team Configuration" size="large" weight={'semibold'} className={`mmt-config-label`} />
                           <TaskModuleButton callback={handleOnCallback} primary title="Team Configuration" path={`admin/config/team/${docType}`} content="Update Team Config" />
                        </Flex>
                        <br />
                        {selectedDocTypeConfigList.teamConfig.length === 0 &&
                           <Flex>
                              <Alert icon={<ExclamationTriangleIcon />}
                                 danger
                                 fitted
                                 content={'Team configuration required!'}
                              />
                           </Flex>
                        }
                        {selectedDocTypeConfigList.teamConfig.map((y, yIndex) =>
                           <Flex fill key={`configItem-${yIndex}`} gap="gap.small">
                              <TeamConfigItem item={y} />
                           </Flex>
                        )}
                     </Flex>
                  </Segment>
               </FlexItem>
            </Flex>
         }
      </Flex>
   );
}

export default ConfigList;