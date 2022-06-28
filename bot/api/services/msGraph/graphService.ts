import 'isomorphic-fetch';

// import axios from 'axios';
// import qs from 'qs';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import {
    TokenCredentialAuthenticationProvider
} from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

import { IClientConfig, IGraphDriveResult, IGraphError, ISharePointFile } from './types';

//const dummyImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAtwAAALcBRi4NFgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAALSSURBVEiJpZbBbttGEIa/HVIyDDGwUjtWD3F88MFA6sApJPdQ9CGCPEHOQR/ASM7OE/QB8gZBb3mAogdbQmsglx4MwwojK6JZ0rAIiyC5m4Mlx5JIqmj+284M/n9md2d2lTGGIgw/f15PLLOnRFoY0wRaY1cbpTpG63YlU0dOozEo4lAFApXwov8apV4BlcIMbpCg1EH9u/U3QLJQIPS8p1j6LYbdBcQzTByTyYv6gwd/3zXL3UXg918i+jCf3BDHI+J4BORUbdhF9GHg91/mVhB63lNEHzKzJcYYfP8C379Aa32TlQirq2usrq6hlJqVStDy06SSSQUVLP12lhzAdT/ieYNbcgCtNZ43wHU/zlcywyUA4UX/dd62XF6GDIdXeSQADIdXXF6G8w7Dbvjv4BWAuur311MbNy/7bveMKBoWCgDUag6PHm3muRI75aEkltnLIwfGB1qOkphKYpk9USKtoohqtbpQoCxGibRk3KG5qNWchQKlMcY0ha/tP4d6/X5phtVqlXr9fpl+S8q8tm2zsbGJyHyYiLCxsYlt22UUCNDOdxnCMMB1u1M9MIHWGtftEoYBuZ19g7agVGfWmmUZ3e4Z5+c94jguzC6OY87Pe3S7Z2RZNh+gVEeM1lMVpGnK6ekJURQVEs8iiiJOT09I03TKbrRuSyVTR9wZs73eJ5JkbuouRJIk9HqfpkyVTB2J02gMMOYNQBgGCzu3DFE0HJ8JoNSB02gMBKC+9v0BiuMgCP43+QRBEIDiePwA3U7TxPf8/dHo+psFRqNrfM/fZ7zttxd8a/vx+3srK+++VeDeysq7re3H7yfrqQ7aedJ87tScfRE1f/EXQERpp+bs7zxpPr9rz330O50/t8Tw+2g0+uG/kC8vL3/IMM+azZ9PZn1FvwoA/vnwV+s6jn/NdPZLlqQPM50tAVhixVbFdi2x/lheWvpte+fHgmkAXwCcikczC3FDYQAAAABJRU5ErkJggg==';


const transformFileResult = (rawData: { value: [] }): ISharePointFile[] => {
   return rawData.value.filter((y: any) => y.folder === undefined).map((x: any) => ({
      id: x.id,
      title: x.name,
      viewUrl: x.webUrl,
      uploaded: true,
      progress: 0,
      contentType: x.file.mimeType,
      size: x.size,
      downloadUrl: (x as any)["@microsoft.graph.downloadUrl"],
      // createdTimestamp: new Date(x.lastModifiedDateTime).getTime(),
      // modifiedTimestamp: new Date(x.lastModifiedDateTime).getTime(),
   }));
}


export interface IGraphService {

}
export default class GraphService implements IGraphService {
   clientConfig: IClientConfig;
   authClient: any;
   client: Client;

   constructor(clientConfig: any) {
      this.clientConfig = clientConfig;
      const credential = new ClientSecretCredential(this.clientConfig.auth.tenantId, this.clientConfig.auth.clientId, this.clientConfig.auth.clientSecret);
      const authProvider = new TokenCredentialAuthenticationProvider(credential, {
         scopes: [".default"]
      });

      this.client = Client.initWithMiddleware({
         debugLogging: true,
         authProvider
      });
   }

   public async getFolderDocuments(_driveId: string, _folderName: string, _docType: string) {
      try {
         const docLibRootQuery = `/drives/${_driveId}/root:`
         let folderExists = true;
         let files = await this.client.api(docLibRootQuery + '/' + _folderName + ':/children').get().catch((error: IGraphError) => {
            if (error.statusCode === 404) {
               folderExists = false
            }
         });
         if (!folderExists)
            files = { value: [] };
         const result = transformFileResult(files);
         return result;
      } catch (error: any) {
         const graphError = {
            status: error.statusCode,
            error: error.message
         }
      }
   }

   public async getDriveAndDocLibDetails(_siteId: string, _docLibName: string): Promise<{ driveId: string, docLibId: string }> {
      try {
         let driveId = await this.getDriveId(_siteId, _docLibName);
         if (driveId === 'notFound')
            return { driveId: 'notFound', docLibId: 'notFound' };
         let docLibId = await this.getDocLibId(driveId);
         return { driveId: driveId, docLibId: docLibId };
      } catch (error: any) {
         debugger;
         return { driveId: 'notFound', docLibId: 'notFound' };
      }
   }

   public async getDriveId(_siteId: string, _docLibName: string): Promise<string> {
      // const config = GraphClient.spSiteConfig;
      try {
         let graphSpDrivesResult = await this.getAllSiteDrives(_siteId);
         let drive = graphSpDrivesResult.find(x => x.driveType === 'documentLibrary' && x.name === _docLibName)
         return drive?.id || '';
      } catch (error: any) {
         debugger;
         return 'notFound';
      }
   }

   public async getDocLibId(_driveId: string): Promise<string> {
      try {
         let graphSpDocLibDriveResult = await this.client.api(`/drives/${_driveId}/root`).get();
         let docLibId = graphSpDocLibDriveResult.id || 'notFound';
         return docLibId;
      } catch (error: any) {
         debugger;
         return 'notFound';
      }
   }

   public async getAllSiteDrives(_siteId: string): Promise<IGraphDriveResult[]> {
      try {
         let graphSpDrivesResult = await this.client.api(`/sites/${_siteId}/drives`).get();
         return graphSpDrivesResult.value as IGraphDriveResult[];
      } catch (error: any) {
         debugger;
         return [];
      }
   }

   // public async getAccessToken() {
   //    const data = qs.stringify({
   //       'grant_type': 'client_credentials',
   //       'client_id': this.clientConfig.auth.clientId,
   //       'scope': 'https://graph.microsoft.com/.default',
   //       'client_secret': this.clientConfig.auth.clientSecret
   //    });
   //    return new Promise(async (resolve) => {
   //       const config = {
   //          method: 'post',
   //          url: 'https://login.microsoftonline.com/' + this.clientConfig.auth.tenantId + '/oauth2/v2.0/token',
   //          headers: {
   //             'Content-Type': 'application/x-www-form-urlencoded'
   //          },
   //          data: data
   //       };
   //       await axios(config)
   //          .then(function (response) {
   //             resolve((response.data).access_token)
   //          })
   //          .catch(function (error) {
   //             resolve(error)
   //          });
   //    })
   // }

   //  async getUser(userId: string) {
   //      const authToken = await this.getBearerToken();
   //      const userProfile = await this.queryGraphApi(authToken, `/users/${userId}`);
   //  }

   //  async queryGraphApi(authToken: string, path: string) {
   //      const rawResult = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
   //          headers: {'Authorization': authToken}
   //      });
   //      return await rawResult.json();
   //  }
}