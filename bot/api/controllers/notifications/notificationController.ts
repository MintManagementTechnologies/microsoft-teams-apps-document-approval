import { CardFactory, CloudAdapter, ConversationReference } from 'botbuilder';

import { AdaptiveCards } from '@microsoft/adaptivecards-tools';

import BotAdapter from '../../../botAdapter';
import rawDocRequestCard from '../../../common/adaptiveCardBuilder/templates/docRequest.json';
import { botId } from '../../../common/envVariables';
import { INotificationModel, ITeamNotificationModel } from '../../../common/types/notification';
import { distinct } from '../../../helpers/sharedFunctions';
import { IApiResponse } from '../baseModel';
import IConversationReferenceController from '../conversationReferences/conversationReferenceController';
import { IConversationReferenceModel } from '../conversationReferences/conversationReferenceModel';

export default interface INotificationController {
}

export class NotificationController implements INotificationController {
   private static botId: string;
   private static botAdapter: CloudAdapter;
   private static conversationReferenceCtrl: IConversationReferenceController;

   constructor(_botAdapter: BotAdapter, _conversationReferenceCtrl: IConversationReferenceController) {
      NotificationController.botId = botId;
      NotificationController.botAdapter = _botAdapter.getAdapter();
      NotificationController.conversationReferenceCtrl = _conversationReferenceCtrl;
   }
   async notifyUsers(req, res, next): Promise<IApiResponse> {
      const model = req.body as INotificationModel;
      // const createdById = req.params.id as string;
      console.log(model);
      const userIds = model.recipients.map(x => x.id).filter(distinct);
      try {
         const conversationReferences =
            await NotificationController.conversationReferenceCtrl.readManyItems(NotificationController.botId, userIds);
         // const card = NotificationController.getAdaptiveCard(model, createdById);
         const card = CardFactory.adaptiveCard(model.card);
         await NotificationController.sendMessages(conversationReferences, card);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: true
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error notifyUsers',
            data: false
         });
      }
      finally {
         return next();
      }
   }
   async notifyTeam(req, res, next): Promise<IApiResponse> {
      const model = req.body as ITeamNotificationModel;
      const teamId = req.params.teamId as string;
      const channelId = req.params.channelId as string;
      try {
         const conversationReferences =
            await NotificationController.conversationReferenceCtrl.readSingleItem(channelId, teamId);
         // const card = NotificationController.getAdaptiveCard(model, createdById);
         const card = AdaptiveCards.declare<ITeamNotificationModel>(rawDocRequestCard).render(model);
         await NotificationController.sendMessages([conversationReferences], CardFactory.adaptiveCard(card));
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: true
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error notifyTeam',
            data: false
         });
      }
      finally {
         return next();
      }
   }

   // private static getAdaptiveCard(_notificationModel: INotificationModel, _createdById: string) {
   //    const cardBuilder = new CardBuilder(_notificationModel.cardData);
   //    cardBuilder.buildCard();
   //    const theCard = cardBuilder.getInitialCard(_notificationModel.requestId, _notificationModel.recipients);
   //    const card = CardFactory.adaptiveCard(theCard);
   //    return card;
   // }

   private static async sendMessages(_conversationReferenceModels: IConversationReferenceModel[], _card: any) {
      const botId = NotificationController.botId;
      const adapter = NotificationController.botAdapter;
      let sentNotifications = [];
      _conversationReferenceModels.forEach(async (model, i) => {
         await adapter.continueConversationAsync(botId, model.conversationReference as Partial<ConversationReference>, async context => {
            let activityResponse = await context.sendActivity({ attachments: [_card] });
            console.log(`${i} Sending... ${model.id}`);
            sentNotifications.push({
               ...model,
               messageId: activityResponse.id
            });
            if (sentNotifications.length === _conversationReferenceModels.length) {
               console.log(`DONE: sendMessages`);
            }
         }).catch(err => {
            debugger;
         });
      });

   }
}