import './common/i18n';

// import i18nextMiddleware from 'i18next-http-middleware';
import * as restify from 'restify';
import corsMiddleware from 'restify-cors-middleware';

import { AzureNamedKeyCredential } from '@azure/data-tables';
import { BlobServiceClient } from '@azure/storage-blob';

import { ActorController } from './api/controllers/actors/actorController';
import { CommentController } from './api/controllers/comments/commentController';
import { ConfigController } from './api/controllers/config/configController';
import {
    ConversationReferenceController
} from './api/controllers/conversationReferences/conversationReferenceController';
import { FileController } from './api/controllers/files/fileController';
import { NotificationController } from './api/controllers/notifications/notificationController';
import { RequestController } from './api/controllers/requests/requestController';
import { UserController } from './api/controllers/users/userController';
import ActorRepo from './api/repositories/actors/actorRepo';
import CommentRepo from './api/repositories/comments/commentRepo';
import ConfigRepo from './api/repositories/config/configRepo';
import ConversationReferenceRepo from './api/repositories/conversationReferences/conversationReferenceRepo';
import FileRepo from './api/repositories/files/fileRepo';
import RequestRepo from './api/repositories/requests/requestRepo';
import UserRepo from './api/repositories/users/userRepo';
import GraphService from './api/services/msGraph/graphService';
import BotAdapter from './botAdapter';
import {
    botId, botPassword, clientId, clientSecret, storageAccount_connectionString,
    storageAccount_containerName, storageAccount_key, storageAccount_name,
    storageAccount_tmpFolderName, tenantId
} from './common/envVariables';
import { IBotConfig, ICredentials } from './common/types';

// removed from package cause I don't know what it is for...
// "build": "tsc --build && shx cp -r ./adaptiveCardBuilder ./build/",
const _storageAccountConfig = {
   storageAccountName: storageAccount_name,
   storageAccountKey: storageAccount_key
}

const _storageContainerConfig = {
   connectionString: storageAccount_connectionString,
   containerName: storageAccount_containerName
}
const _tmpFolderName = storageAccount_tmpFolderName

const _botConfig: IBotConfig = {
   id: botId,
   password: botPassword
};

const clientConfig = {
   auth: {
      clientId: clientId,
      clientSecret: clientSecret,
      tenantId: tenantId
   }
};
const graphSvc = new GraphService(clientConfig);

const credential = new AzureNamedKeyCredential(_storageAccountConfig.storageAccountName, _storageAccountConfig.storageAccountKey);
const configRepo = new ConfigRepo({
   serviceAccountUrl: `https://${_storageAccountConfig.storageAccountName}.table.core.windows.net`,
   credentials: credential
});
const fileCtrl = new FileController(new FileRepo(_storageContainerConfig), configRepo, _tmpFolderName, graphSvc);

const configCtrl = new ConfigController(configRepo);

const userCtrl = new UserController(new UserRepo({
   serviceAccountUrl: `https://${_storageAccountConfig.storageAccountName}.table.core.windows.net`,
   credentials: credential
}));

const requestCtrl = new RequestController(new RequestRepo({
   serviceAccountUrl: `https://${_storageAccountConfig.storageAccountName}.table.core.windows.net`,
   credentials: credential
}));

const actorCtrl = new ActorController(new ActorRepo({
   serviceAccountUrl: `https://${_storageAccountConfig.storageAccountName}.table.core.windows.net`,
   credentials: credential
}));

const commentCtrl = new CommentController(new CommentRepo({
   serviceAccountUrl: `https://${_storageAccountConfig.storageAccountName}.table.core.windows.net`,
   credentials: credential
}));

const conversationReferenceCtrl = new ConversationReferenceController(new ConversationReferenceRepo({
   serviceAccountUrl: `https://${_storageAccountConfig.storageAccountName}.table.core.windows.net`,
   credentials: credential
}));

const botCredentials: ICredentials = _botConfig;
const adapter = new BotAdapter(botCredentials, conversationReferenceCtrl, configCtrl);

const notificationCtrl = new NotificationController(adapter, conversationReferenceCtrl);

// Create HTTP server.
const server = restify.createServer();
const cors = corsMiddleware({
   preflightMaxAge: 5, //Optional
   origins: ['*'],
   allowHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'],
   exposeHeaders: ['*']
});
server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());
// server.use(i18nextMiddleware.handle(i18n));
server.listen(process.env.port || process.env.PORT || 3978, () => {
   console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
   configCtrl.ensureRefNumberExists();
});

server.post("/api/messages", adapter.processMessages);

/* Request Endpoints */
server.post('/api/requests', requestCtrl.createSingleItem);

server.get('/api/requests', requestCtrl.readAllItems);
server.get('/api/requests/outcome/:outcome', requestCtrl.readManyItemsByOutcome);
server.get('/api/requests/user/:upn', requestCtrl.readManyItems);
server.get('/api/requests/:id', requestCtrl.readSingleItem);

server.put('/api/requests', requestCtrl.updateManyItems);
server.put('/api/requests/:id', requestCtrl.updateSingleItem);

// server.del('/api/requests', requestCtrl.deleteManyItems);
server.del('/api/requests/:id', requestCtrl.deleteSingleItem);


/* Actor Endpoints */
server.post('/api/actors', actorCtrl.createManyItems);

server.get('/api/actors', actorCtrl.readManyItems);
server.get('/api/actors/request/:id', actorCtrl.readManyItems);
server.get('/api/actors/:id', actorCtrl.readSingleItem);

server.put('/api/actors', actorCtrl.updateManyItems);
server.put('/api/actors/:id', actorCtrl.updateSingleItem);
server.del('/api/actors/:id/request/:requestId', actorCtrl.deleteSingleItem);

/* Comments Endpoints */
server.post('/api/comments', commentCtrl.createSingleItem);
server.get('/api/comments/request/:id', commentCtrl.readManyItems);
server.del('/api/comments/:id/request/:requestId', commentCtrl.deleteSingleItem);
server.put('/api/comments/:id', commentCtrl.updateSingleItem);

/* User Endpoints */
server.post('/api/users', userCtrl.createManyItems);
server.get('/api/users', userCtrl.readManyItems);
server.get('/api/users/:id', userCtrl.readSingleItem);
server.del('/api/users/:id', userCtrl.deleteSingleItem);
server.put('/api/users/:id', userCtrl.updateSingleItem);

/* Notification Endpoints */
server.post('/api/notify/users', notificationCtrl.notifyUsers);
server.post('/api/notify/team/:teamId/channel/:channelId', notificationCtrl.notifyTeam);

/* Config Endpoints */
server.get('/api/config', configCtrl.getAllConfig);
server.get('/api/config/refNumber', configCtrl.getNewRefNumber);
server.get('/api/config/spConfig/:docType', configCtrl.getSiteConfig);
server.post('/api/config/spConfig', configCtrl.createSiteConfig);
server.put('/api/config/spConfig', configCtrl.updateSiteConfig);
server.get('/api/config/team/:docType', configCtrl.getTeamConfig);
server.post('/api/config/team', configCtrl.createTeamConfig);
server.put('/api/config/team', configCtrl.updateTeamConfig);

/* Files Endpoints */
server.post('/api/files/upload/:folderId', fileCtrl.uploadFile);
server.get('/api/files/templates/:docType', fileCtrl.getDocTypeTemplates);
server.get('/api/files/:folderId', fileCtrl.getFiles);
server.get('/api/files/download/:folderId/:fileId', fileCtrl.downloadFile);
server.put('/api/files/move/:docType/:refNumber', fileCtrl.moveFiles);
server.del('/api/files/:folderId/:fileid', fileCtrl.deleteFile);
server.del('/api/files/:folderId', fileCtrl.deleteFolder);