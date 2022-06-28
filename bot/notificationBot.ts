import {
    ActivityTypes, AdaptiveCardInvokeResponse, AdaptiveCardInvokeValue, CardFactory,
    ConversationReference, StatusCodes, TaskModuleRequest, TaskModuleResponse, TeamsActivityHandler,
    TurnContext
} from 'botbuilder';

import { AdaptiveCards } from '@microsoft/adaptivecards-tools';

import IConfigController from './api/controllers/config/configController';
import IConversationReferenceController from './api/controllers/conversationReferences/conversationReferenceController';
import {
    IConversationReferenceModel
} from './api/controllers/conversationReferences/conversationReferenceModel';
import { actionsManager } from './common/adaptiveCardBuilder/actions/actionManager';
import { AdaptiveCardBuilder } from './common/adaptiveCardBuilder/cardBuilder';
import rawDocRequestCard from './common/adaptiveCardBuilder/templates/docRequest.json';
import rawWelcomeCard from './common/adaptiveCardBuilder/templates/welcome.json';
import { botId, tabBaseUrl, userTeamsAppId } from './common/envVariables';
import { ICardData } from './common/types/adaptiveCard';
import { INotificationModel, ITeamNotificationModel } from './common/types/notification';
import { invokeResponse, TaskModuleResponseFactory } from './helpers/taskModuleHelper';

interface IOpenUrlData {
   appId: string;
   baseAppUrl: string;
   title: string;
}

export class NotificationBot extends TeamsActivityHandler {
   private static tmpConversationReferenceCtrl: IConversationReferenceController;
   private conversationReferenceCtrl: IConversationReferenceController;
   private static tmpConfigCtrl: IConfigController;
   private configCtrl: IConfigController;

   constructor(_conversationReferenceCtrl: IConversationReferenceController, _configCtrl: IConfigController) {
      super();
      this.conversationReferenceCtrl = _conversationReferenceCtrl;
      NotificationBot.tmpConversationReferenceCtrl = _conversationReferenceCtrl;

      this.configCtrl = _configCtrl;
      NotificationBot.tmpConfigCtrl = _configCtrl;

      this.onMembersAdded(this.handleOnMembersAdded);
      this.onMessage(this.handleOnMessage);
   }

   async handleOnMembersAdded(context: TurnContext, next: () => Promise<void>) {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
         if (membersAdded[cnt].id && membersAdded[cnt].aadObjectId) {
            const appId = userTeamsAppId;
            const data = {
               appId: appId,
               baseAppUrl: (`${tabBaseUrl}/index.html#`),
               title: `New Request`
            };
            const card = AdaptiveCards.declare<IOpenUrlData>(rawWelcomeCard).render(data);
            await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
            //TODO: locale: context.activity.locale
            //TODO: upn: ??
            let newConversationReference: IConversationReferenceModel = {
               partitionId: botId,
               id: context.activity.from.aadObjectId,
               conversationReference: {
                  bot: {
                     id: botId,
                  },
                  conversation: {
                     conversationType: context.activity.conversation.conversationType,
                     tenantId: context.activity.conversation.tenantId,
                     id: context.activity.conversation.id,
                  },
                  channelId: context.activity.channelId,
                  serviceUrl: context.activity.serviceUrl,
               }
            };
            await NotificationBot.tmpConversationReferenceCtrl.createSingleItem(newConversationReference);
            break;
         }
         else if(membersAdded[cnt].id && context.activity.conversation.conversationType === 'channel'){
            let newConversationReference: IConversationReferenceModel = {
               partitionId: context.activity.channelData.team.aadGroupId,
               id: context.activity.channelData.settings.selectedChannel.id,
               conversationReference: {
                  bot: {
                     id: botId,
                  },
                  conversation: {
                     conversationType: context.activity.conversation.conversationType,
                     tenantId: context.activity.conversation.tenantId,
                     id: context.activity.conversation.id,
                  },
                  channelId: context.activity.channelId,
                  serviceUrl: context.activity.serviceUrl,
               }
            };
            await NotificationBot.tmpConversationReferenceCtrl.createSingleItem(newConversationReference);
         }
      }
      await next();
   }

   async handleOnMessage(context: TurnContext, next: () => Promise<void>) {
      console.log("Running with Message Activity.");

      let txt = context.activity.text;
      const removedMentionText = TurnContext.removeRecipientMention(
         context.activity
      );
      if (removedMentionText) {
         // Remove the line break
         txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }

      // Trigger command by IM text
      switch (txt) {
         case "welcome": {
            const appId = userTeamsAppId;
            const data = {
               appId: appId,
               baseAppUrl: (`${tabBaseUrl}/index.html#`),
               // baseAppUrl: encodeURIComponent(`${tabBaseUrl}/index.html#`),
               title: `New Request`
            };
            const card = AdaptiveCards.declare<IOpenUrlData>(rawWelcomeCard).render(data);
            await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
            break;
         }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
   }

   async onInvokeActivity(context: TurnContext) {
      console.log('Activity: ', context.activity.name);

      if (context.activity.name === 'adaptiveCard/action') {
         const action = context.activity.value.action;
         console.log('Verb: ', action.verb);
         if (action.verb === 'reminder') {
            await this.handleBotReminderMessageTask(context, action.data);
            return invokeResponse('Reminder sent', 'message');
         } else if (action.verb === 'docRequest') {
            await this.handleBotDocRequestMessageTask(context, action.data);
            return invokeResponse('Document requested', 'message');
         }
      } else if (context.activity.name === 'task/fetch') {
         const taskModuleResponse = await this.handleTeamsTaskModuleFetch(context, context.activity.value.data);
         return {
            status: 200,
            body: taskModuleResponse
         }
      } else if (context.activity.name === 'task/submit') {
         try {
            await context.sendActivity({ value: null, type: ActivityTypes.InvokeResponse });
         } catch (error) {
            const taskModuleCloseResponse =
               await TaskModuleResponseFactory.toTaskModuleResponse('You can now close the modal.');
            return {
               status: 200,
               body: taskModuleCloseResponse
            }
         }
      } else {
         await context.sendActivity(`Oops! ${context.activity.name}`);
      }
   }

   async handleBotReminderMessageTask(context: TurnContext, _notificationData: INotificationModel) {
      const conversationReferences =
         await this.conversationReferenceCtrl.readManyItems(botId, _notificationData.recipients.map(x => x.id));
      const actions = actionsManager('actor', _notificationData).defaultActions();
      const card = this.getAdaptiveCard(_notificationData.cardData, actions);
      const attachment = CardFactory.adaptiveCard(card);
      await this.sendMessages(context, conversationReferences, attachment);
   }

   async handleBotDocRequestMessageTask(context: TurnContext, _notificationData: INotificationModel) {
      const requestDetails = _notificationData.item as ITeamNotificationModel;
      const requestedById = context.activity.from.aadObjectId;
      const requestedBy = context.activity.from.name;
      const requestedByUPN = requestDetails.usersInvolved.find(x => x.id === requestedById)?.upn;

      const docTypeTeam = await this.configCtrl.getDocTypeTeamConfig(requestDetails.docType);
      const conversationReference =
         await this.conversationReferenceCtrl.readSingleItem(docTypeTeam.channelId, docTypeTeam.teamId);
      
      const data = {
         docType: requestDetails.docType,
         title: requestDetails.title,
         refNumber: requestDetails.refNumber,
         requestedBy: requestedBy,
         requestedByUPN: requestedByUPN,
      }

      const card = AdaptiveCards.declare<ITeamNotificationModel>(rawDocRequestCard).render(data);
      const attachment = CardFactory.adaptiveCard(card);
      await this.sendMessages(context, [conversationReference], attachment);
   }
   
   private getAdaptiveCard(_cardData: ICardData, _actions: any[]) {
      const appId = userTeamsAppId;
      const cardBuilder = new AdaptiveCardBuilder(appId, _cardData);
      cardBuilder.buildCard(undefined, 'reminder');
      const theCard = cardBuilder.getCard(_actions);
      return theCard;
   }

   private async sendMessages(context: TurnContext, _conversationReferenceModels: IConversationReferenceModel[], _card: any) {
      let sentNotifications = [];
      _conversationReferenceModels.forEach(async (model, i) => {
         await context.adapter.continueConversationAsync(botId, model.conversationReference as Partial<ConversationReference>, async context => {
            let activityResponse = await context.sendActivity({ attachments: [_card] });
            console.log(`${i} Sending... ${model.id}`);
            sentNotifications.push({
               ...model,
               messageId: activityResponse.id
            });
            if (sentNotifications.length === _conversationReferenceModels.length) {
               console.log(`DONE: sendMessages`);
            }
         }).catch(() => {
            debugger;
         });
      });
   }

   handleTeamsTaskModuleFetch(context, taskModuleRequest) {
      const cardTaskFetchValue = taskModuleRequest.data;
      var taskInfo = {
         height: 700,
         width: 1200,
         title: cardTaskFetchValue.title,
         url: cardTaskFetchValue.url,
         fallbackUrl: cardTaskFetchValue.url,
      } as any;
      return TaskModuleResponseFactory.toTaskModuleResponse(taskInfo);
   }

   // Invoked when an action is taken on an Adaptive Card. The Adaptive Card sends an event to the Bot and this
   // method handles that event.
   async onAdaptiveCardInvoke(
      context: TurnContext,
      invokeValue: AdaptiveCardInvokeValue
   ): Promise<AdaptiveCardInvokeResponse> {
      return { statusCode: 200, type: undefined, value: undefined };
   }

   protected handleTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
      return;
   }
}