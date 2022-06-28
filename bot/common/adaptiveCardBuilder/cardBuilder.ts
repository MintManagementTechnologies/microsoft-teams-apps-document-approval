import { factsTableComp, IFactsTableProps } from './baseComponents/factsTable';
import { headerComp, IHeaderProps } from './baseComponents/header';
import { IOutcomeStatusProps, outcomeStatusComp } from './baseComponents/outcomeStatus';
import { IOverdueMessageProps, overdueMessageComp } from './baseComponents/overdueMessage';
import { IProgressTableProps, progressTableComp } from './baseComponents/progressTable';
import { ITitleProps, titleComp } from './baseComponents/title';
import { ICardData, IFact, IProgressRow } from './types/adaptiveCard';

export default interface IAdaptiveCardBuilder {
   cardData: ICardData,
   headerComp: IHeaderProps,
   outcomeStatusComp: IOutcomeStatusProps,
   titleComp: ITitleProps,
   factsTableComp: IFactsTableProps,
   overdueMessageComp: IOverdueMessageProps,
   progressTableComp: IProgressTableProps,
   buildCard: (_cardData?: ICardData) => void,
   getCard: () => any,
}

export class AdaptiveCardBuilder implements IAdaptiveCardBuilder {
   appId: string;
   cardData: ICardData;
   headerComp!: IHeaderProps;
   outcomeStatusComp!: IOutcomeStatusProps;
   titleComp!: ITitleProps;
   factsTableComp!: IFactsTableProps;
   overdueMessageComp!: IOverdueMessageProps;
   progressTableComp!: IProgressTableProps;

   constructor(_appId: string, _cardData: ICardData) {
      this.appId = _appId;
      this.cardData = _cardData;
      this.buildCard(_cardData);
   }

   buildCard(_cardData?: ICardData, _cardType?: string) {
      const data = _cardData || this.cardData;
      if (!data)
         debugger;
      this.setHeader(data.refNumber, _cardType);
      this.setOutcomeStatus(data.outcome);
      this.setTitle(data.title);
      this.setFactsTable(data.facts, data.outcome);
      this.setOverdueMessage(data.createdTimestamp);
      this.setProgressTable(data.progressTable);
   }

   getCard(_actions?: any[], _exclude: string[] = []) {
      const bodyItems = [
         this.getBodyItem_HeaderAndOutcomeStatus(),
         this.getBodyItem_Title(),
         this.getBodyItem_FactsTable()
      ];

      if (!_exclude.includes('overdueMsg')) {
         bodyItems.push(this.getBodyItem_OverdueMessage() as any);
      }
      if (!_exclude.includes('progressTable')) {
         bodyItems.push(
            this.getBodyItem_ShowProgressToggle() as any,
            this.getBodyItem_ProgressTable() as any
         );
      }

      return {
         $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
         appId: this.appId,
         type: 'AdaptiveCard',
         version: '1.4',
         body: bodyItems,
         actions: _actions || []
      };
   }

   private setHeader(_refNumber: string, _cardType?: string) {
      this.headerComp = headerComp(_refNumber, _cardType);
   }

   private setOutcomeStatus(_outcome: string) {
      this.outcomeStatusComp = outcomeStatusComp(_outcome);
   }

   private setTitle(_title: string) {
      this.titleComp = titleComp(_title);
   }

   private setFactsTable(_facts: IFact[], _outcome: string) {
      this.factsTableComp = factsTableComp(_facts, _outcome);
   }

   private setOverdueMessage(_noOfDays: number) {
      this.overdueMessageComp = overdueMessageComp(_noOfDays);
   }

   private setProgressTable(_progressTable: IProgressRow[]) {
      this.progressTableComp = progressTableComp(_progressTable);
   }

   private getBodyItem_HeaderAndOutcomeStatus() {
      return {
         "type": "ColumnSet",
         "columns": [
            this.headerComp,
            this.outcomeStatusComp
         ]
      }
   }

   private getBodyItem_Title() {
      return this.titleComp;
   }

   private getBodyItem_FactsTable() {
      return this.factsTableComp;
   }

   private getBodyItem_OverdueMessage() {
      return this.overdueMessageComp;
   }

   private getBodyItem_ShowProgressToggle() {
      return {
         "type": "ColumnSet",
         "spacing": "Small",
         "columns": [
            {
               "type": "Column",
               "width": "stretch"
            },
            {
               "type": "Column",
               "width": "auto",
               "items": [
                  {
                     "type": "TextBlock",
                     "text": "Show Progress",
                     "wrap": true,
                     "color": "Accent",
                     "id": "showToggle",
                     "weight": "Bolder"
                  },
                  {
                     "type": "TextBlock",
                     "text": "Hide Progress",
                     "wrap": true,
                     "weight": "Bolder",
                     "color": "Accent",
                     "id": "hideToggle",
                     "isVisible": false
                  }
               ],
               "selectAction": {
                  "type": "Action.ToggleVisibility",
                  "targetElements": [
                     "progressToggle",
                     "showToggle",
                     "hideToggle"
                  ]
               }
            }
         ]
      }
   }

   private getBodyItem_ProgressTable() {
      return this.progressTableComp;
   }
}