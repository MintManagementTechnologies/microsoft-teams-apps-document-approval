import { getBaseUrl, getRouteParams } from 'common/utils/helpers/urlHelpers';
import {
    useGetRequestsByActorQuery, useLazyGetRequestsByActorQuery
} from 'features/requests/requestService';
import { useGetAllUsersQuery, useLazyGetAllUsersQuery } from 'features/users/userService';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RootState, useTypedSelector } from 'store';
import { v4 as uuid } from 'uuid';

// import { upperFirstLetter } from '~helpers/stringHelpers';
// import { getBaseUrl, getRouteParams } from '~helpers/urlHelpers';
import { AddIcon, Button, Divider, Flex, Text } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import DashboardToggle from '../../../features/filters/dashboardToggle/DashboardToggle';
import Filters from '../../../features/filters/Filters';
import SearchBox from '../../../features/filters/searchBox/SearchBox';

const TopActionsBar = (props: { loading: boolean }): JSX.Element => {
   const { loading } = props;
   const { t, i18n } = useTranslation();
   const navigate = useNavigate();
   const { userScope, view, action } = getRouteParams(window.location.hash);

   const currentEntity = view === 'users' ? 'user' : 'memo';
   const isMyDashboard = userScope === 'me' && view === 'dashboard';
   const isUsersDashboard = view === 'users';
   const isApprovalCustodianDashboard = userScope === 'admin' && view === 'dashboard';

   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   // let userUPN;
   const [triggerRefreshRequests] = useLazyGetRequestsByActorQuery();
   const [triggerRefreshUsers] = useLazyGetAllUsersQuery();
   const submitHandler = (err: any, result: any) => {
      if (result === "refresh") {
         triggerRefreshRequests(currentUser.upn);
      } else if (result === "refreshUsers") {
         triggerRefreshUsers();
      } else {
         console.log("DONT REFRESH");
      }
      //alert(result);
   };

   const handleOnClick = (_event: any, _action: string, _id: string) => {
      let entity = isUsersDashboard ? 'User' : '';
      const taskInfo = {
         url: getBaseUrl() + `/me/${view}/${_action}/${_id}`,
         title: `${t(`taskModule.title.${_action}${entity}`)}`,
         height: 400,
         width: 400,
      };
      microsoftTeams.tasks.startTask(taskInfo, submitHandler);
   }
   
   // microsoftTeams.initialize();

   const test = (_event: any) => {
      const appId = '4658b632-66dc-40c8-9c1c-60fcf21cc6e0';
      const contentUrl = 'https://documentapprovalapp.blob.core.windows.net/documents/4658b632-66dc-40c8-9c1c-60fcf21cc6e0/1041-memo-1.dotx';
      const websiteUrl = 'https://documentapprovalapp.blob.core.windows.net/documents/4658b632-66dc-40c8-9c1c-60fcf21cc6e0/1041-memo-1.dotx';
      let url = "https://teams.microsoft.com/l/stage/"+appId+"/0?context=" + encodeURIComponent(`{"contentUrl":"${contentUrl}","websiteUrl":"${websiteUrl}"}`);
            alert("URL - " + url);
            // microsoftTeams.app.openLink(url);
            microsoftTeams.executeDeepLink(url)
      // microsoftTeams.tasks.startTask(taskInfo, submitHandler);
   }

   return (
      <Container fluid>
         <Row key='topActionsBar-row' className='mmt-topActionsBar'>
            {loading ? (
               <Col key='topActionsBar-col-loading'>
                  <Flex hAlign='center'>
                     <Text content={' '} />
                  </Flex>
               </Col>
            ) :
               (<>
                  <Col key='topActionsBar-col-newBtn' className='gx-3'>
                     <Flex fill vAlign="center" gap='gap.small'>
                        {/* <Button
                           icon={<AddIcon />}
                           content={'Test Stage'}
                           onClick={(event) => test(event)}
                           primary
                        /> */}
                        {isApprovalCustodianDashboard && <Text content={t(`tab.approvalCustodian.header`)} weight={'semibold'} />}
                        {isUsersDashboard &&
                           <>
                              <Text content={t(`tab.${view}.header`)} weight={'semibold'} />
                              <Divider vertical size={1} />
                              <Button
                                 icon={<AddIcon />}
                                 content={t('common:button.createEntity', { entity: t(`common:entity.${currentEntity}`, { count: 1 }) })}
                                 onClick={(event) => handleOnClick(event, 'new', uuid())}
                                 primary
                              />
                           </>
                        }
                        {isMyDashboard &&
                           <>
                              <DashboardToggle />
                              <Divider vertical size={1} />
                              <Button
                                 icon={<AddIcon />}
                                 content={t('common:button.createEntity', { entity: t(`common:entity.${currentEntity}`, { count: 1 }) })}
                                 onClick={(event) => handleOnClick(event, 'new', uuid())}
                                 primary
                              />
                           </>
                        }
                     </Flex>
                  </Col>
                  <Col className='mmt-topActionsBar-col' key='topActionsBar-col-layoutToggle'>
                     <Flex fill vAlign="center" hAlign='start' gap='gap.small'>
                     </Flex>
                  </Col>
                  <Col className='mmt-topActionsBar-col' xl={4} lg={3} md={6} sm={9} key='topActionsBar-col-search'>
                     <Flex fill hAlign='end' vAlign="center" gap='gap.small'>
                        {!isUsersDashboard && <Filters disabled={false} />}
                        <SearchBox disabled={false} />
                     </Flex>
                  </Col>
               </>)}
         </Row>
      </Container>

   );

}

export default TopActionsBar;