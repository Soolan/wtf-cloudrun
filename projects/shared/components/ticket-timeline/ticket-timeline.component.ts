import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TicketTimeline} from '@shared/interfaces';

@Component({
  selector: 'lib-ticket-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-timeline.component.html',
  styleUrls: ['./ticket-timeline.component.scss'],
})
export class TicketTimelineComponent {
  @Input() events: TicketTimeline[] = [];

  showDate(emoji: string): boolean {
    return emoji !== 'start' && emoji !== 'end';
  }

}
