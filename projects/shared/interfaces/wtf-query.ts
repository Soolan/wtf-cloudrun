import {OrderByDirection, WhereFilterOp } from "@angular/fire/firestore";

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
