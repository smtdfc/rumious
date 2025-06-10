export type RumiousChangeCommitType =
 | 'set'
 | 'append'
 | 'prepend'
 | 'insert'
 | 'update'
 | 'remove'
 
export interface RumiousChangeCommit<T> {
  state:T;
  type:RumiousChangeCommitType;
  value:any;
  key?:number;
}

export type RumiousStateBind < T = any > = (commit:RumiousChangeCommit<T>) => void;
