
import { actionsManager } from 'common/utils/adaptiveCardBuilder/actions/actionManager';
import { AdaptiveCardBuilder } from 'common/utils/adaptiveCardBuilder/cardBuilder';
import {
    ICardData, IFact, IProgressRow
} from 'common/utils/adaptiveCardBuilder/types/adaptiveCard';
// import { INotificationModel } from 'common/utils/adaptiveCardBuilder/types/notification';
import { defaultAvatar } from 'common/utils/commonVariables';
import { userTeamsAppId } from 'common/utils/envVariables';
import { getLocaleDate } from 'common/utils/helpers/localeHelpers';
import i18n from 'common/utils/i18n';
import { differenceInDays } from 'date-fns';
import { IActorModel } from 'features/actors/actor';
import { IRequestModel } from 'features/requests/request';

// import { IActorModel } from '@common/types/actor';
// import { ICardData, IFact, IProgressRow } from '@common/types/adaptiveCard';
import { INotificationModel } from '@common/types/notification';

// import { IRequestModel } from '@common/types/request';

// import { getLocaleDate } from '~helpers/localeHelpers';

export class NotificationBuilder {
   private static request: IRequestModel;
   private static actors: IActorModel[];
   private static notificationModel: INotificationModel;

   public static buildNotification(_request: IRequestModel, _actors: IActorModel[]) {
      NotificationBuilder.request = _request;
      NotificationBuilder.actors = _actors;

      const currentActors = NotificationBuilder.actors
         .filter(x => x.level === NotificationBuilder.request.currentLevel && x.version === NotificationBuilder.request.version);
      const cardData: ICardData = {
         progressTable: NotificationBuilder.generateProgressTable(),
         facts: NotificationBuilder.generateFactSet(),
         refNumber: NotificationBuilder.request.refNumber.toString(),
         outcome: NotificationBuilder.request.outcome,
         title: NotificationBuilder.request.title,
         createdTimestamp: NotificationBuilder.request.createdTimestamp || new Date().getTime(),
      };
      
      NotificationBuilder.notificationModel = {
         item: NotificationBuilder.createNotificationItem(_request, _actors),
         recipients: [
            { personaType: 'requestor', id: NotificationBuilder.request.createdById, upn: NotificationBuilder.request.createdByUPN },
            ...currentActors.map(x => ({ personaType: x.personaType, id: x.userId, upn: x.upn }))
         ],
         cardData: cardData
      }

      return {
         getRequestorNotification: () => {
            return NotificationBuilder.getRequestorNotification();
         },
         getActorsNotification: () => {
            return NotificationBuilder.getActorsNotification();
         },
         getAllNotifications: () => {
            return NotificationBuilder.getAllNotifications();
         },
      }
   }

   private static createNotificationItem(_request: IRequestModel, _actors: IActorModel[]) {
      if(_request.outcome === 'approved')
         return NotificationBuilder.createFinalNotificationItem(_request, _actors);
      return {
         id: _request.id,
         createdByDisplayName: _request.createdByDisplayName,
         createdByUPN: _request.createdByUPN,
      }
   }

   private static createFinalNotificationItem(_request: IRequestModel, _actors: IActorModel[]): any {
      const allUsersInvolved = _actors.filter(x => x.version === _request.version).map(x => ({
         id: x.userId,
         displayName: x.title,
         upn: x.upn,
      }));
      allUsersInvolved.push({
         id: _request.createdById,
         displayName: _request.createdByDisplayName,
         upn: _request.createdByUPN,
      });
      const result:any = {
         docType: _request.docType,
         title: _request.title,
         refNumber: _request.refNumber,
         requestedBy: 'NA-DisplayName',
         requestedByUPN: 'NA-UPN',
         usersInvolved: allUsersInvolved
      };
      return result;
   }

   private static getRequestorNotification() {
      const actions = NotificationBuilder.getRequestorActions();
      const excludeCardData = NotificationBuilder.isSameDay() ? [] : ['overdueMsg'];

      const recipients = [{ personaType: 'requestor', id: NotificationBuilder.request.createdById, upn: NotificationBuilder.request.createdByUPN }];
      const card = NotificationBuilder.getAdaptiveCard(actions, excludeCardData);
      return { card, recipients };
   }

   private static getActorsNotification() {
      const actions = actionsManager(NotificationBuilder.request.outcome === 'approved' ? 'all' : 'actor', NotificationBuilder.notificationModel).defaultActions();
      const excludeCardData = NotificationBuilder.isSameDay() ? [] : ['overdueMsg'];

      const recipients = NotificationBuilder.getActorRecipients();
      const card = NotificationBuilder.getAdaptiveCard(actions, excludeCardData);
      return { card, recipients };
   }

   private static getAllNotifications() {

   }

   private static getStatusContent(_outcome: string, _endorsementType: string, _displayName: string): { statusContent: string, outcome: string } {
      let statusColor = 'orange';
      let statusContent = '';
      let outcome = _outcome || 'pending';
      switch (outcome) {
         case 'recommended':
         case 'supported':
         case 'approved':
            statusContent = `${i18n.t(`form.outcome.sentenceValue.approved`, {
               outcome: i18n.t(`form.outcome.value.${outcome}`),
               displayName: _displayName
            })}`;
            statusColor = 'green';
            outcome = 'approved';
            break;
         case 'rejected':
            statusContent = `${i18n.t(`form.outcome.sentenceValue.${outcome}`, {
               outcome: i18n.t(`form.endorsementType.verbValue.${_endorsementType}`),
               displayName: _displayName
            })}`
            statusColor = 'red';
            break;
         default:
            statusContent = `${i18n.t(`form.outcome.sentenceValue.${outcome}`, {
               outcome: i18n.t(`form.endorsementType.verbValue.${_endorsementType}`),
               displayName: _displayName
            })}`
            break;
      }
      return { statusContent, outcome };
   }

   private static generateProgressTable(): IProgressRow[] {
      // let progressTable: IProgressRow[] = [];
      const progressTable = NotificationBuilder.actors.filter(x => x.personaType === "actor").map(y => {
         const { statusContent, outcome } = NotificationBuilder.getStatusContent(y.outcome, y.endorsementType, y.title);
         return {
            level: y.level,
            outcome: outcome,
            statusContent: statusContent,
            completedTimestamp: y.completedTimestamp
         }
      });

      return progressTable;
   }

   private static generateFactSet(): IFact[] {
      const currentApproverImgs = NotificationBuilder.actors.filter(x => x.level === NotificationBuilder.request.currentLevel).map(y => y.image || defaultAvatar);
      const facts: IFact[] = [{
         type: "text",
         key: "createdBy",
         value: NotificationBuilder.request.createdByDisplayName
      }, {
         type: "date",
         key: "created",
         value: getLocaleDate(NotificationBuilder.request.createdTimestamp, 'dd/MM/yyyy')
      }, {
         type: "text",
         key: "classificationType",
         value: i18n.t(`form.classification.value.${NotificationBuilder.request.classificationType}`) as string,
      }, {
         type: "array",
         key: "currentApproversUPN",
         value: currentApproverImgs
      }]

      return facts;
   }

   private static getAdaptiveCard(_actions: any[], _excludeCardData: string[]) {
      const appId = userTeamsAppId || '';
      const cardBuilder = new AdaptiveCardBuilder(appId, NotificationBuilder.notificationModel.cardData);
      cardBuilder.buildCard();
      const theCard = cardBuilder.getCard(_actions, _excludeCardData);
      return theCard;
   }

   private static getActorRecipients() {
      let recipients = NotificationBuilder.actors;
      if (NotificationBuilder.request.outcome === 'pending') {
         recipients = NotificationBuilder.actors.filter(x => x.level === NotificationBuilder.request.currentLevel);
      }
      else if (NotificationBuilder.request.outcome === 'rejected') {
         recipients = NotificationBuilder.actors.filter(x => x.level <= NotificationBuilder.request.currentLevel);
      }
      return recipients.map(x => ({ personaType: x.personaType, id: x.userId, upn: x.upn }));
   }

   private static getRequestorActions() {
      const _outcome = NotificationBuilder.request.outcome;
      if (_outcome === 'pending') {
         return actionsManager('requestor', NotificationBuilder.notificationModel).defaultActions() as any[];
      }
      else if (_outcome === 'rejected') {
         return (actionsManager('requestor', NotificationBuilder.notificationModel) as any).rejectedActions() as any[];
      }
      return actionsManager('all', NotificationBuilder.notificationModel).defaultActions() as any[];
   }

   private static isSameDay(): boolean {
      const _createdTimestamp = NotificationBuilder.request.createdTimestamp;
      let nowDate = new Date().toDateString();
      let createdDate = new Date(_createdTimestamp).toDateString();
      const createdDaysDiff = differenceInDays(new Date(nowDate), new Date(createdDate));
      return createdDaysDiff === 0;
   }
}