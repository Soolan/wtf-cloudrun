import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

export const FADE = trigger('fade', [
  state('in', style({ opacity: 1 })),
  state('out', style({ opacity: 0 })),

  transition('* => in', [
    animate('0.4s ease-in', keyframes([
      style({ opacity: 0, offset: 0 }),
      style({ opacity: 1, offset: 1 })
    ]))
  ]),

  transition('* => out', [
    animate('1s', style({ opacity: 0 }))
  ]),
]);
