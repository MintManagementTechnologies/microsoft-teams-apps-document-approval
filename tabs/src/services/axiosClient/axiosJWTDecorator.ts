import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getCurrentUserUPN } from 'common/utils/helpers/contextHelpers';
import i18n from 'common/utils/i18n';

import * as microsoftTeams from '@microsoft/teams-js';

let debuggingAxios = true;

export class AxiosJWTDecorator {
   private graphToken: string = '';
   public async get<T = any, R = AxiosResponse<T>>(
      url: string,
      handleError: boolean = true,
      needAuthorizationHeader: boolean = false,
      config?: AxiosRequestConfig,
   ): Promise<R> {
      try {
         if (needAuthorizationHeader) {
            config = await this.setupAuthorizationHeader(config);
         }
         return await axios.get(url, config);
      } catch (error) {
         debugger;
         if (handleError) {
            this.handleError(error, 'get');
            throw error;
         }
         else {
            throw error;
         }
      }
   }

   public async delete<T = any, R = AxiosResponse<T>>(
      url: string,
      handleError: boolean = true,
      needAuthorizationHeader: boolean = false,
      config?: AxiosRequestConfig
   ): Promise<R> {
      try {
         if (needAuthorizationHeader) {
            config = await this.setupAuthorizationHeader(config);
            return await axios.delete(url, config);
         } else {
            return await axios.delete(url);
         }
      } catch (error) {
         if (handleError) {
            this.handleError(error, 'delete');
            throw error;
         }
         else {
            throw error;
         }
      }
   }

   public async post<T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      handleError: boolean = true,
      needAuthorizationHeader: boolean = false,
      config?: AxiosRequestConfig
   ): Promise<R> {
      try {
         if (needAuthorizationHeader) {
            config = await this.setupAuthorizationHeader(config);
            return await axios.post(url, data, config);
         } else {
            return await axios.post(url, data);
         }
      } catch (error) {
         if (handleError) {
            this.handleError(error, 'post');
            throw error;
         }
         else {
            throw error;
         }
      }
   }

   public async put<T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      handleError: boolean = true,
      needAuthorizationHeader: boolean = false,
      config?: AxiosRequestConfig
   ): Promise<R> {
      try {
         if (needAuthorizationHeader) {
            config = await this.setupAuthorizationHeader(config);
            return await axios.put(url, data, config);
         } else {
            return await axios.put(url, data);
         }
      } catch (error) {
         if (handleError) {
            this.handleError(error, 'put');
            throw error;
         }
         else {
            throw error;
         }
      }
   }

   public getAuthToken(): string {
      return this.graphToken;
   }

   private setAuthToken(token: string): void {
      this.graphToken = token;
      console.info('Graph token set');
   }

   private handleError(error: any, method: string): void {
      console.error(`---${method}---`);
      console.log(error);
      console.error(`---${method}---`);
      if (error.hasOwnProperty("response")) {
         const errorStatus = error.response.status;
         if (errorStatus === 403) {
            window.location.href = `/errorpage/403?locale=${i18n.language}`;
         } else if (errorStatus === 401) {
            // handle refresh token...
            window.location.href = `/errorpage/401?locale=${i18n.language}`;
         } else {
            window.location.href = `/errorpage?locale=${i18n.language}`;
         }
      } else {
         window.location.href = `/errorpage?locale=${i18n.language}`;
      }
   }

   public initAuthorize() {
      microsoftTeams.initialize(() => {
         microsoftTeams.getContext((ctx) => {
            const currentUserUPN = ctx.userPrincipalName ? ctx.userPrincipalName.toLowerCase() : '';
            return new Promise<string>((resolve, reject) => {
               const authTokenRequest = {
                  successCallback: async (token: string) => {
                     let serverURL = `/getGraphAccessToken?ssoToken=${token}&upn=${currentUserUPN}`;
                     let response = await fetch(serverURL).catch((error) => { console.error('setupAuthorizationHeader-Fetch'); console.log(error); });
                     let data = await response!.json().catch((error) => { console.error('setupAuthorizationHeader-ParsJson'); console.log(error); });
                     this.graphToken = data.graphToken;
                     resolve(this.graphToken);
                  },
                  failureCallback: (error: string) => {
                     // When the getAuthToken function returns a "resourceRequiresConsent" error, 
                     // it means Azure AD needs the user's consent before issuing a token to the app. 
                     // The following code redirects the user to the "Sign in" page where the user can grant the consent. 
                     // Right now, the app redirects to the consent page for any error.
                     console.error("Error from getAuthToken: ", error);
                     //window.location.href = `/auth?locale=${i18n.language}`;
                     window.location.href = `/auth-start.html?locale=en-us`;
                  },
                  resources: []
               };
               microsoftTeams.authentication.getAuthToken(authTokenRequest);
            });
         });
      });

   }

   private async setupAuthorizationHeader(
      _config?: AxiosRequestConfig
   ): Promise<AxiosRequestConfig> {
      const currentUserUPN = getCurrentUserUPN();
      let config: AxiosRequestConfig;
      if (this.graphToken) {
         return new Promise<AxiosRequestConfig>((resolve, reject) => {
            //@ts-ignore
            config = _config ? _config : axios.defaults;
            //@ts-ignore
            config.headers["Authorization"] = `Bearer ${this.graphToken}`;
            //@ts-ignore
            config.headers["Accept-Language"] = `${i18n.language}`;
            //@ts-ignore
            resolve(config);
         });
      }
      microsoftTeams.initialize();
      return new Promise<AxiosRequestConfig>((resolve, reject) => {
         const authTokenRequest = {
            successCallback: async (token: string) => {
               let serverURL = `/getGraphAccessToken?ssoToken=${token}&upn=${currentUserUPN}`;
               let response = await fetch(serverURL).catch((error) => { console.error('setupAuthorizationHeader-Fetch'); console.log(error); });
               let data = await response!.json().catch((error) => { console.error('setupAuthorizationHeader-ParsJson'); console.log(error); });
               if (!_config) {
                  //@ts-ignore
                  config = axios.defaults;
               }
               this.graphToken = data.graphToken;
               //@ts-ignore
               config.headers["Authorization"] = `Bearer ${data.graphToken}`;
               //@ts-ignore
               config.headers["Accept-Language"] = i18n.language;
               //@ts-ignore
               resolve(config);
            },
            failureCallback: (error: string) => {
               // When the getAuthToken function returns a "resourceRequiresConsent" error, 
               // it means Azure AD needs the user's consent before issuing a token to the app. 
               // The following code redirects the user to the "Sign in" page where the user can grant the consent. 
               // Right now, the app redirects to the consent page for any error.
               console.error("Error from getAuthToken: ", error);
               //window.location.href = `/auth?locale=${i18n.language}`;
               window.location.href = `/auth-start.html?locale=en-us`;
            },
            resources: []
         };
         microsoftTeams.authentication.getAuthToken(authTokenRequest);
      });
   }
}

const axiosJWTDecoratorInstance = new AxiosJWTDecorator();
export default axiosJWTDecoratorInstance;