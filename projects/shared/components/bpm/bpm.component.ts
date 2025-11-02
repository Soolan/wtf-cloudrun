import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-bpm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bpm.component.html',
  styleUrls: ['./bpm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BpmComponent {

}
