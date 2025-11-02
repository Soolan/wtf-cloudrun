// import {OrderByDirection, WhereFilterOp } from "@angular/fire/firestore";

type OrderByDirection = 'asc' | 'desc';
type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any'
  | 'not-in';


export interface WtfQuery {
  path: string;
  limit?: number;
  where?: Where;
  orderBy?: OrderBy;
}

export interface Where {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface OrderBy {
  field: string;
  direction: OrderByDirection;
}
