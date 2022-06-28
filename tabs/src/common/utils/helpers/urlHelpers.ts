import { apiUrl, tabBaseUrl } from '../envVariables';

interface IRouteParams {
   userScope: string;
   view: string;
   action: string;
   id: string | undefined;
   pageIndex: number | undefined;
}

export const getBaseUrl = (): string => {
   return (tabBaseUrl + "#");
}

export const getApiBaseUrl = (local: boolean = false): string => {
   let returnUrl = '';
   returnUrl = `${apiUrl}/api/`;
   console.log('getApiBaseUrl');
   console.log(returnUrl);
   return returnUrl;
}

export const getRouteParams = (_path: string): IRouteParams => {
   const tmpPath = _path.startsWith('#') ? _path.slice(1) : _path;
   const queryParamIndex = tmpPath.indexOf('?');
   const path = queryParamIndex > -1 ? tmpPath.substring(0, queryParamIndex) : tmpPath;
   const paramArr = path.split('/').splice(1);
   let result: any;
   if (paramArr.length >= 3) {
      result = {
         userScope: paramArr[0],
         view: paramArr[1],
         action: paramArr[2],
         id: paramArr[3],
         pageIndex: undefined
      };

      if (result.action === 'browse' && paramArr.length >= 4) {
         result.pageIndex = paramArr[3] ? parseInt(paramArr[3]) : 1;
      } else if (
         (result.action === 'edit' || result.action === 'view' || result.action === 'approve') &&
         paramArr.length >= 4
      ) {
         result.id = paramArr[3];
      }
   } else {
      result = {
         userScope: 'NA',
         view: 'NA',
         action: 'NA',
         layout: 'NA',
         id: 'NA',
         pageIndex: -1
      };
   }
   return result;
};