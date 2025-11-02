import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BpaNodeWithId } from '@shared/interfaces/bpa'; // Import BpaNodeWithId

@Component({
  selector: 'lib-bpa-node-palette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bpa-node-palette.component.html',
  styleUrls: ['./bpa-node-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BpaNodePaletteComponent {
  @Input() nodes: BpaNodeWithId[] | null = [];
}
