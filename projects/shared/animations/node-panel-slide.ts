import {animate, state, style, transition, trigger} from '@angular/animations';

export const NODE_PANEL_SLIDE = trigger('slidePanel', [
  state('void', style({transform: 'translateX(100%)'})),
  state('*', style({transform: 'translateX(0)'})),
  transition('void => *', [
    animate('200ms ease-in-out')
  ]),
  transition('* => void', [
    animate('200ms ease-in-out', style({transform: 'translateX(100%)'}))
  ])
]);
