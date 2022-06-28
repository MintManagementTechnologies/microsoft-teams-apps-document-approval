export const generateBotAction = (_title: string, _notificationType: string, _notificationData: any) => {
   const action = {
      type: "Action.Execute",
      title: `${_title}`,
      verb: `${_notificationType}`,
      data: _notificationData
   }
   return action;
}

export const generateDeepLinkAction = (_title: string, _link: string) => {
   const action = {
      type: "Action.OpenUrl",
      title: `${_title}`,
      url: `${_link}`
   }
   return action;
}

export const generateTaskModuleAction = (_title: string, _link: string) => {
   const action = {
      type: "Action.Submit",
      title: `${_title}`,
      data: {
         msteams: { "type": "task/fetch" },
         data: {
            title: `${_title}`,
            url: `${_link}`
         }
      }
   }
   return action;
}