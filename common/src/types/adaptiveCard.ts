export interface IHeader {
   refNumber: string,
}

export interface IOutcomeStatus {
   outcome: string,
}

export interface ITitle {
   title: string,
}

export interface IFact {
   type: string,
   key: string,
   value: number | string | string[],
}

export interface IOverdueMessage {
   createdTimestamp: number,
   // modifiedTimestamp?: number,
   // noOfDays?: number,
}

export interface IProgressRow {
   level: number,
   outcome: string, // approved | rejected | pending | skipped
   statusContent: string,
   completedTimestamp: number,
}

export interface ICardData extends
   IHeader,
   IOutcomeStatus,
   ITitle,
   IOverdueMessage {
      progressTable: IProgressRow[],
      facts: IFact[],
}