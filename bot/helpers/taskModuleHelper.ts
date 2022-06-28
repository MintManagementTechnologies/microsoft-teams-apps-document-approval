import { StatusCodes, TaskModuleResponse } from 'botbuilder';

export class TaskModuleResponseFactory {
   static createResponse(taskModuleInfoOrString) {
      if (typeof taskModuleInfoOrString === 'string') {
         return new Promise<TaskModuleResponse>((resolve, reject) => {
            resolve({
               task: {
                  type: 'message',
                  value: taskModuleInfoOrString
               }
            } as any);
         });
      }
      return new Promise<TaskModuleResponse>((resolve, reject) => {
         resolve({
            task: {
               type: 'continue',
               value: taskModuleInfoOrString
            }
         } as any);
      });
   }

   static toTaskModuleResponse(taskInfo) {
      return TaskModuleResponseFactory.createResponse(taskInfo);
   }
}

export const setTaskInfo = (taskInfo, uiSettings) => {
   taskInfo.height = uiSettings.height;
   taskInfo.width = uiSettings.width;
   taskInfo.title = uiSettings.title;
}

export const buildCommandURL = (_baseUrl: string, _view: string, _command: string, _itemId: string): string => {
   const _queryParams = '';//`locale={locale}&upn={userPrincipalName}`;
   let appEntityUrl = `${_baseUrl}#/me/${_view}/${_command}/${_itemId}?${_queryParams}`;
   return appEntityUrl;
}

export class UISettings {
   width: number;
   height: number;
   title: string;
   // id: string;
   // buttonTitle: string;

   constructor(width, height, title) {
      this.width = width;
      this.height = height;
      this.title = title;
      // this.id = id;
      // this.buttonTitle = buttonTitle;
   }
}

export const TaskModuleIds = {
   New: 'New',
   EditActors: 'Edit Actors',
   Approve: 'Approve',
   Edit: 'Edit',
   View: 'Details'
};

export const TaskModuleUIConstants = {
   New: new UISettings(1200, 700, 'New Request'),
   Edit: new UISettings(1200, 700, 'Edit Request'),
   EditActors: new UISettings(1200, 700, 'Edit Actors'),
   View: new UISettings(1200, 700, 'Request Details'),
   Approve: new UISettings(1200, 700, 'Approve Request')
};

export const invokeResponse = (_responseValue: any, _type: 'card' | 'message') => {
   const body = {
      statusCode: StatusCodes.OK,
      type: _type === 'card' ? 'application/vnd.microsoft.card.adaptive' : 'application/vnd.microsoft.activity.message',
      value: _responseValue
   };
   const res = {
      status: StatusCodes.OK,
      body: body
   };
   return res;
};