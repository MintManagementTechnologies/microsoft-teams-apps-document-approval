

// import { IActorModel } from '@common/types/actor';
// import { IRequestModel } from '@common/types/request';

import { IBaseUserModel } from 'common/types/user';
import { IActorModel } from 'features/actors/actor';
import { ITeamConfigModel } from 'features/config/types';
import { IRequestModel } from 'features/requests/request';

import { baseApi } from '../../services';
import { NotificationBuilder } from './notificationsBuilder';

export const notificationService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      notifyUsers: build.mutation<void, { request: IRequestModel, actors: IActorModel[] }>({
         query(data) {
            const { request, actors } = data;
            const notifications = NotificationBuilder.buildNotification(request, actors);
            const { card: actorsCard, recipients: actorsRecipients } = notifications.getActorsNotification();
            const { card, recipients } = notifications.getRequestorNotification();
            const body = {
               requestId: request.id,
               recipients: recipients,
               card: card
            }
            return {
               url: `notify/users`,
               method: 'POST',
               body,
            };
         }
      }),
      notifyRequestor: build.mutation<void, { request: IRequestModel, actors: IActorModel[] }>({
         query(data) {
            const { request, actors } = data;
            const { card, recipients } = NotificationBuilder.buildNotification(request, actors).getRequestorNotification();
            const body = {
               requestId: request.id,
               recipients: recipients,
               card: card
            }
            return {
               url: `notify/users`,
               method: 'POST',
               body,
            };
         }
      }),
      notifyActors: build.mutation<void, { request: IRequestModel, actors: IActorModel[] }>({
         query(data) {
            const { request, actors } = data;
            const { card, recipients } = NotificationBuilder.buildNotification(request, actors).getActorsNotification();
            const body = {
               requestId: request.id,
               recipients: recipients,
               card: card
            }
            return {
               url: `notify/users`,
               method: 'POST',
               body,
            };
         }
      }),
      notifyTeam: build.mutation<void, { request: IRequestModel, docRequestedBy: { title: string, upn: string }, teamConfig: ITeamConfigModel }>({
         query(data) {
            const { request, docRequestedBy, teamConfig } = data;
            const body = {
               docType: request.docType,
               title: request.title,
               refNumber: request.refNumber,
               requestedBy: docRequestedBy.title,
               requestedByUPN: docRequestedBy.upn,
            }
            return {
               url: `notify/team/${teamConfig.teamId}/channel/${teamConfig.channelId}`,
               method: 'POST',
               body,
            };
         }
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: notificationEndpoints,
   useNotifyUsersMutation,
   useNotifyRequestorMutation,
   useNotifyActorsMutation,
   useNotifyTeamMutation,
} = notificationService;