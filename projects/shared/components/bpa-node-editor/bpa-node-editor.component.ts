import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BpaNodeWithId } from '@shared/interfaces/bpa';
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'lib-bpa-node-editor',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './bpa-node-editor.component.html',
  styleUrls: ['./bpa-node-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BpaNodeEditorComponent {
  @Input() node: BpaNodeWithId | null = null;
}