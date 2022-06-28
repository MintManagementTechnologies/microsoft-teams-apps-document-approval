import {
    CloudAdapter, ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration, TurnContext
} from 'botbuilder';

import IConfigController from './api/controllers/config/configController';
import IConversationReferenceController from './api/controllers/conversationReferences/conversationReferenceController';
import { ICredentials } from './common/types';
import { NotificationBot } from './notificationBot';

export default class BotAdapter {
   private id: string;
   adapter: any;
   notificationBot: any;

   constructor(botCredentials: ICredentials, _conversationReferenceCtrl: IConversationReferenceController, _configCtrl: IConfigController) {
      this.id = botCredentials.id;
      const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
         MicrosoftAppId: botCredentials.id,
         MicrosoftAppPassword: botCredentials.password,
         //MicrosoftAppType: process.env.MicrosoftAppType,
         //MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
      });
      const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
      this.adapter = new CloudAdapter(botFrameworkAuthentication);
      this.adapter.onTurnError = this.onTurnErrorHandler;
      this.notificationBot = new NotificationBot(_conversationReferenceCtrl, _configCtrl);
   }

   public getAdapter(): CloudAdapter {
      return this.adapter as CloudAdapter;
   }

   // Catch-all for errors.
   onTurnErrorHandler = async (context: TurnContext, error: Error) => {
      // This check writes out errors to console log .vs. app insights.
      // NOTE: In production environment, you should consider logging this to Azure
      //       application insights.
      console.error(`\n [onTurnError] unhandled error: ${error}`);

      // Send a trace activity, which will be displayed in Bot Framework Emulator
      await context.sendTraceActivity(
         "OnTurnError Trace",
         `${error}`,
         "https://www.botframework.com/schemas/error",
         "TurnError"
      );

      // Send a message to the user
      await context.sendActivity(`The bot encountered unhandled error:\n ${error.message}`);
   };

   processMessages = async (req, res) => {
      console.log('processMessages');
      await this.adapter.process(req, res, (context) => this.notificationBot.run(context));
   }
}