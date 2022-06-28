import './ConfigTab.scss';

import { getBaseUrl, getRouteParams } from 'common/utils/helpers/urlHelpers';
import TaskModuleButton from 'components/common/buttons/TaskModuleButton';
import ConfigList from 'features/config/ConfigList';
import { useGetAllConfigQuery } from 'features/config/configService';
import { listChanged } from 'features/config/configSlice';
import { useEffect } from 'react';
import { useAppDispatch } from 'store';

// import { useTranslation } from 'react-i18next';
// import { upperFirstLetter } from '~helpers/stringHelpers';
// import { getBaseUrl } from '~helpers/urlHelpers';
import { Button, Flex, Header, Segment, Text } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';

import UsersList from '../../features/users/UsersList';

const ConfigTab = (): JSX.Element => {
   // const { t, i18n } = useTranslation();
   const dispatch = useAppDispatch();
   const { userScope, view, action, id } = getRouteParams(window.location.hash);
   const { data: dataGetAllConfig, isFetching: isFetchingGetAllConfig, isLoading: isLoadingGetAllConfig }
      = useGetAllConfigQuery();


   useEffect(() => {
      if (!dataGetAllConfig) return;
      dispatch(listChanged(dataGetAllConfig));
   }, [dataGetAllConfig]);

   const submitHandler = (err: any, result: any) => {
      //alert(result);
   };

   const handleOnClick = (_event: any, _action: string, _id: string) => {
      const taskInfo = {
         url: getBaseUrl() + `/admin/users/${_action}/${_id}`,
         title: `${_action.upperFirstLetter()} Request`,
         height: 700,
         width: 1200,
      };
      microsoftTeams.tasks.startTask(taskInfo, submitHandler);
   }

   const hasConfig = dataGetAllConfig && dataGetAllConfig.length > 0;
   return (
      <>
         <Flex fill column gap="gap.small" padding="padding.medium">
            <Flex gap="gap.small" column>
               <Header as="h4" content={'Document Approval Config'}
                  description={{
                     content: "Manage the Records Management Sites and Teams associated with all Memos.",
                     className: 'mmt-header-description'
                  }}
               />
            </Flex>
            {hasConfig &&
               <>
                  {dataGetAllConfig.map((docTypeConfig, i) =>
                     // <Segment key={`segment-docTypeConfig-${i}`}>
                        <Flex column gap="gap.small" key={`segment-docTypeConfig-${i}`}>
                           <Text content={docTypeConfig.docType.upperFirstLetter()} weight="bold" size="large" />
                           {/* <Flex gap="gap.small" fill>
                              <TaskModuleButton title="" path="" content="Update Site Config" />
                              <TaskModuleButton title="" path="" content="Update Team Config" />
                           </Flex> */}
                           <ConfigList docType={docTypeConfig.docType} />
                        </Flex>
                     // </Segment>
                  )}
               </>
            }
         </Flex>
      </>
   );
}

export default ConfigTab;