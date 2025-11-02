import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

export const CARD_FLIP = trigger('flip', [
  state('front', style({ transform: 'rotateY(0deg)' })),
  state('back', style({ transform: 'rotateY(180deg)' })),

  transition('front => back', [
    animate(
      '0.5s ease-in-out',
      keyframes([
        style({ transform: 'perspective(800px) rotateY(45deg) scale(1.05)', offset: 0.3 }),
        style({ transform: 'perspective(800px) rotateY(90deg) scale(1)', offset: 0.5 }),
        style({ transform: 'perspective(800px) rotateY(135deg) scale(1.05)', offset: 0.7 }),
        style({ transform: 'perspective(800px) rotateY(180deg) scale(1)', offset: 1 })
      ])
    )
  ]),

  transition('back => front', [
    animate(
      '0.5s ease-in-out',
      keyframes([
        style({ transform: 'perspective(800px) rotateY(135deg) scale(1.05)', offset: 0.3 }),
        style({ transform: 'perspective(800px) rotateY(90deg) scale(1)', offset: 0.5 }),
        style({ transform: 'perspective(800px) rotateY(45deg) scale(1.05)', offset: 0.7 }),
        style({ transform: 'perspective(800px) rotateY(0deg) scale(1)', offset: 1 })
      ])
    )
  ])
]);
