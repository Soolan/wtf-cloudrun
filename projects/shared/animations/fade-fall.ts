import { animate, keyframes, style, transition, trigger } from '@angular/animations';

export const FADE_FALL = trigger('fadeFall', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-20px)' }),
    animate('2s ease-out', keyframes([
      style({ opacity: 1, transform: 'translateY(0)', offset: 0.3 }),
      style({ transform: 'translateY(-15px)', offset: 0.5 }),
      style({ transform: 'translateY(0)', offset: 0.65 }),
      style({ transform: 'translateY(-10px)', offset: 0.8 }),
      style({ transform: 'translateY(0)', offset: 1.0 })
    ]))
  ]),
  transition(':leave', [
    animate('2s ease-in', keyframes([
      style({ transform: 'translateY(-10px)', offset: 0.2 }),
      style({ transform: 'translateY(0)', offset: 0.3 }),
      style({ transform: 'translateY(-20px)', offset: 0.4 }),
      style({ transform: 'translateY(0)', offset: 0.5 }),
      style({ opacity: 0, transform: 'translateY(-50px)', offset: 1.0 })
    ]))
  ])
]);
