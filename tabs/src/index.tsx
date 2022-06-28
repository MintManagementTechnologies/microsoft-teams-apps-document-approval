import './common/utils/helpers/stringHelpers';
import './index.scss';

import { verifyEnvConfig } from 'common/utils/envVariables';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { v4 as uuid } from 'uuid';

import App from './App';
import { store } from './store';

// const teamsAppConfig:ITeamsAppConfig = {
//    graphScope: process.env.REACT_APP_GRAPHSCOPE || 'notFound',
//    baseApiUrl: process.env.REACT_APP_API_URL || 'notFound',
//    baseTeamsAppUrl: window.location.origin,
//    userTeamsAppId: process.env.REACT_APP_USER_TEAMSAPP_ID || 'notFound',
//    adminTeamsAppId: process.env.REACT_APP_ADMIN_TEAMSAPP_ID || 'notFound'
// }
// EnvConfig.setTeamsAppConfig(teamsAppConfig);

console.clear();
if (window.location.href.includes('/new/generateId')) {
   let newUrl = window.location.href.replace('/hash/', '#/');
   const newId = uuid();
   newUrl = window.location.href.replace('/new/generateId', `/new/${newId}`);
   window.location.href = newUrl;
}

verifyEnvConfig();
ReactDOM.render(
   <Provider store={store}>
      <App />
   </Provider>,
   document.getElementById("root")
);