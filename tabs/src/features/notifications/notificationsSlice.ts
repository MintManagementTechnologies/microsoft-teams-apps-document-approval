import { ICardData } from '@common/types/adaptiveCard';
import { INotificationModel } from '@common/types/notification';
import { createSlice } from '@reduxjs/toolkit';

import i18n from '../../common/utils/i18n';

const cardData: ICardData = {
   progressTable: [],
   facts: [],
   refNumber: "",
   outcome: "",
   title: "",
   createdTimestamp: 0,
   // noOfDays: 0
};
const initialState: INotificationModel & {messageStatus: string} = {
   item: {
      id: "",
   },
   recipients: [],
   cardData: cardData,
   messageStatus: ''
};

const notificationsSlice = createSlice({
   name: 'notifications',
   initialState,
   reducers: {
      notificationCreated(state, action) {
         const tmp = i18n.t('form.classification.value.confidential');
         const { id, recipients, cardData } = action.payload;
         state = action.payload;
      },
   },
})

export const { notificationCreated } = notificationsSlice.actions;
export default notificationsSlice.reducer;