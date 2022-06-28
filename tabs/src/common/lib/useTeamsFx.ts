import { graphScope } from 'common/utils/envVariables';
import { setCurrentUserUPN } from 'common/utils/helpers/contextHelpers';
import { getLocale } from 'common/utils/helpers/localeHelpers';
import { useTeams } from 'msteams-react-base-component';
import { useEffect } from 'react';

import { IProvider, Providers, ProviderState } from '@microsoft/mgt-element';
import { TeamsFxProvider } from '@microsoft/mgt-teamsfx-provider';
import { Client } from '@microsoft/microsoft-graph-client';
import {
    createMicrosoftGraphClient, IdentityType, LogLevel, setLogFunction, setLogLevel, TeamsFx
} from '@microsoft/teamsfx';

import { userDetailsChanged } from '../../features/users/userSlice';
import { GraphClient } from '../../services/graphClientService';
import { useAppDispatch } from '../../store';
import { setLocale } from '../utils/i18n';
import { useData } from './useData';

var _graphScope = graphScope ? graphScope.split(' ') : [];

// TODO fix this when the SDK stops hiding global state!
let initialized = false;
let ctxInitialized = false;
let userCtx = {
   title: '' as any,
   upn: '',
   id: '' as any,
   locale: '',
}

export function useTeamsFx() {
   let graphClient:Client|null = null;
   const dispatch = useAppDispatch();
   const [result] = useTeams({});
   let isAuthenticated = false;
   if (result.context && !ctxInitialized) {
      ctxInitialized = true;
      userCtx = {
         title: undefined,
         upn: result.context?.userPrincipalName ? result.context?.userPrincipalName.toLowerCase() : '',
         id: result.context?.userObjectId || undefined,
         locale: result.context?.locale || getLocale(),
      }
   }
   useEffect(() => {
      if (ctxInitialized) {
         setCurrentUserUPN(userCtx.upn);
         dispatch(userDetailsChanged(userCtx));
         setLocale(userCtx.locale);
      }
   }, [dispatch, userCtx]);

   const { error, loading, data, reload } = useData(async () => {
      if (!initialized) {
         setLogLevel(LogLevel.Verbose);
         setLogFunction((leve: LogLevel, message: string) => { console.log(message); });
         if (process.env.NODE_ENV === "development") {
         }
         let scope = _graphScope;
         const teamsfx = new TeamsFx(IdentityType.User);
			graphClient = await createMicrosoftGraphClient(teamsfx, scope);
         isAuthenticated = true;
         GraphClient.setInstance(graphClient);
         await teamsfx.login(scope);
         console.log("Logged in. FINALLY");
         initialized = true;
         return teamsfx
      }
   });
   return { error, reload, loading, teamsfx: data, isAuthenticated, userCtx, graphClient, ...result };
}
