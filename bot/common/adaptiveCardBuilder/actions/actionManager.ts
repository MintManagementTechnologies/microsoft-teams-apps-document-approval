import { baseChatDeepLinkUrl } from '../../commonVariables';
import { tabBaseUrl } from '../../envVariables';
import i18n from '../../i18n';
import { INotificationModel, IRecipient } from '../types/notification';
import {
    generateBotAction, generateDeepLinkAction, generateTaskModuleAction
} from './actionTemplates';

const taskModuleLinkHelper = (_action: string, _id: string) => {
   const baseAppUrl = `${tabBaseUrl}/index.html#/me/memo`;
   const appUrl = `${baseAppUrl}/${_action}/${_id}`;
   return appUrl;
}

export const actionsManager = (personaType: 'requestor' | 'actor' | 'pa' | 'all', _notificationData: INotificationModel) => {
   const remindActor_notificationData: INotificationModel = {
      ..._notificationData,
      recipients: _notificationData.recipients.filter((x: IRecipient) => x.personaType === 'actor')
   };

   const remindPA_notificationData: INotificationModel = {
      ..._notificationData,
      recipients: _notificationData.recipients.filter((x: IRecipient) => x.personaType === 'pa')
   };

   const docRequest_notificationData: INotificationModel = {
      ..._notificationData,
      recipients: _notificationData.recipients.filter((x: IRecipient) => x.personaType === 'pa')
   };

   const edit_action = generateTaskModuleAction(`${i18n.t(`adaptiveCard.action.edit`)}`, taskModuleLinkHelper(`edit`, _notificationData.item.id));
   const withdraw_action = generateTaskModuleAction(`${i18n.t(`adaptiveCard.action.withdraw`)}`, taskModuleLinkHelper(`edit`, _notificationData.item.id));
   const editActors_action = generateTaskModuleAction(`${i18n.t(`adaptiveCard.action.editactors`)}`, taskModuleLinkHelper(`editactors`, _notificationData.item.id));

   const remindActor_action = generateBotAction(`${i18n.t(`adaptiveCard.action.remindActor`)}`, `reminder`, remindActor_notificationData);
   const remindPA_action = generateBotAction(`${i18n.t(`adaptiveCard.action.remindPA`)}`, `reminder`, remindPA_notificationData);

   const chatWithActor_recipients = _notificationData.recipients.filter((x: IRecipient) => x.personaType === 'actor')
      .map((x: IRecipient) => x.upn).join(",");
   const chatWithActor_action = generateDeepLinkAction('chatWithActor', `${baseChatDeepLinkUrl}?users=${chatWithActor_recipients}`);

   const chatWithPA_recipients = _notificationData.recipients.filter((x: IRecipient) => x.personaType === 'pa')
      .map((x: IRecipient) => x.upn).join(",");
   const chatWithPA_action = generateDeepLinkAction('chatWithPA', `${baseChatDeepLinkUrl}?users=${chatWithPA_recipients}`);

   // const review_action = generateTaskModuleAction(`${i18n.t(`adaptiveCard.action.review`)}`, taskModuleLinkHelper(`approve`, _notificationData.item.id));
   // const chatWithRequestor_action = generateDeepLinkAction(`${i18n.t(`adaptiveCard.action.chatWithEntity`, {
   //    entity: `${_notificationData.item.createdByDisplayName}`
   // })}`, `${baseChatDeepLinkUrl}?users=${_notificationData.item.createdByUPN}`);

   const review_action = generateTaskModuleAction(`Review`, taskModuleLinkHelper(`approve`, _notificationData.item.id));
   const chatWithRequestor_action = generateDeepLinkAction(`Chat with User`, `${baseChatDeepLinkUrl}?users=${_notificationData.item.createdByUPN}`);

   // const downloadDoc_action = generateDeepLinkAction(`${i18n.t(`adaptiveCard.action.downloadDoc`)}`, documentLinkHelper('Test%20Memo.pdf'));
   const docRequest_action = generateBotAction(`Request Document`, `docRequest`, docRequest_notificationData);

   switch (personaType) {
      case 'requestor':
         return {
            defaultActions: (): any[] => {
               const actions = [withdraw_action, editActors_action, remindActor_action];
               if (_notificationData.recipients.filter((x: IRecipient) => x.personaType === 'pa').length > 0) {
                  actions.push(remindPA_action)
               }
               return actions;
            },
            rejectedActions: (): any[] => {
               const actions = [edit_action, withdraw_action, chatWithActor_action];
               if (_notificationData.recipients.filter((x: IRecipient) => x.personaType === 'pa').length > 0) {
                  actions.push(chatWithPA_action)
               }
               return actions;
            },
         }
      case 'actor':
         return {
            defaultActions: (): any[] => {
               const actions = [review_action, chatWithRequestor_action];
               return actions;
            },
            rejectedActions: (): any[] => { return [] },
         }
      default:
         return {
            defaultActions: (): any[] => {
               const actions = [docRequest_action];
               return actions;
            },
            completedActions: (): any[] => { return [] },
            noActions: (): any[] => { return [] },
         }
   }
}