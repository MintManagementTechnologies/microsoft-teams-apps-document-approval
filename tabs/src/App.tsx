import './App.scss';

import { graphScope } from 'common/utils/envVariables';
import { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { GraphClient } from 'services/graphClientService';
import ConfigTab from 'views/configTab/ConfigTab';

import { Button, Flex, Provider, teamsTheme } from '@fluentui/react-northstar';
import { createMicrosoftGraphClient } from '@microsoft/teamsfx';
import { useData, useGraph, useTeamsFx } from '@microsoft/teamsfx-react';

import Loader from './components/common/Loader';
import Layout from './components/layouts/Layout';
import { TeamsFxContext } from './Context';
import User from './features/users/User';
import { userDetailsChanged } from './features/users/userSlice';
import { RootState, useAppDispatch, useTypedSelector } from './store';
import DashboardTab from './views/dashboardTab/DashboardTab';
import TabConfig from './views/modals/TabConfig';
import ModalContainer from './views/shared/modals/ModalContainer';
import UserAdminTab from './views/userAdminTab/UserAdminTab';

/**
 * The main app which handles the initialization and routing
 * of the app.
 */
// const tmpGraphScope = "User.Read User.ReadBasic.All Presence.Read.All Sites.ReadWrite.All Team.ReadBasic.All".split(' ');
const tmpGraphScope = graphScope ? graphScope.split(' ') : [];

export default function App() {
   const [initialized, setInitialized] = useState(false);
   const dispatch = useAppDispatch();

   const currentUser = useTypedSelector((state: RootState) => state.currentUser);

   const { loading, theme, themeString, teamsfx, context } = useTeamsFx();

   const { loading: loadingGraph, error: errorGraph, data: dataGraph, reload: reloadGraph } = useGraph(
      async (graph: any, teamsfx: any, scope: any) => {
         if (teamsfx === undefined) return;
         GraphClient.setInstance(graph);
         const profile = await graph.api("/me").get();
         setInitialized(true);
         return profile;
      },
      { scope: tmpGraphScope, teamsfx: teamsfx }
   );

   useEffect(() => {
      if (loading) return;
      reloadGraph();
   }, [loading]);

   useEffect(() => {
      if (!dataGraph) return;
      console.log(`setting dataGraph`);
      console.log(dataGraph);
      console.log(`EEdataGraph`);
      const userCtx = {
         title: dataGraph.displayName,
         upn: dataGraph.userPrincipalName.toLowerCase(),
         id: dataGraph.id
      };
      dispatch(userDetailsChanged(userCtx));
   }, [dataGraph]);


   const isLoading = loading || !initialized;// || !currentUser.title;
   return (
      <TeamsFxContext.Provider value={{ theme, themeString, teamsfx, context }}>
         <Provider theme={theme || teamsTheme}>
            <div className={`mmt-appContainer mmt-${themeString}`} >
               <Router>
                  {isLoading ? (<>
                     <Loader message={'App'} />
                  </>
                  ) : (
                     <>
                        {/* {showAuthBtn &&
                           <Flex fill hAlign='center' padding={"padding.medium"}>
                              <Button primary content="Authorize" disabled={loadingGraph} onClick={reloadGraph} />
                           </Flex>
                        } */}
                        <Routes>
                           <Route path="/" element={<Layout />}>
                              <Route path=":userScope" >
                                 <Route path={"dashboard"} >
                                    <Route path="browse/:pageIndex/" element={<DashboardTab />} />
                                 </Route>
                                 <Route path={"users"} >
                                    <Route path="browse/:pageIndex/" element={<UserAdminTab />} />
                                 </Route>
                                 <Route path="config" >
                                    <Route path="browse/:pageIndex/" element={<ConfigTab />} />
                                 </Route>
                                 <Route path="settings" >
                                    <Route path="tabconfig" element={<TabConfig />} />
                                 </Route>
                                 <Route path={":view"} >
                                    <Route path={":action"}>
                                       <Route path=":id" element={<ModalContainer />} />
                                    </Route>
                                 </Route>
                              </Route>
                              <Route path="tabconfig" element={<TabConfig />} />
                           </Route>
                        </Routes>
                     </>
                  )}
               </Router>
               {!isLoading && <User loading={isLoading} /> }
            </div>
         </Provider>
      </TeamsFxContext.Provider>
   );
}
