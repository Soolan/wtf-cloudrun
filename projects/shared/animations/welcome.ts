import { animate, state, style, transition, trigger } from '@angular/animations';

export const WELCOME = trigger('welcome', [
    state('center', style({opacity: 1, transform: 'translateY(0) scale(1)'})),
    state('top', style({opacity: 1, transform: 'translateY(-40px) scale(0.8)'})),
    transition('void => center', [
      style({ opacity: 0 }),
      animate('200ms ease-out')
    ]),
    transition('center => top', [
      animate('100ms ease-in')
    ])
  ]);
