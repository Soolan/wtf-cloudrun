import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {RELEASE_ENTRIES, RELEASE_ENTRIES_ICONS} from '@shared/constants';

@Component({
  selector: 'lib-release-notes',
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIcon,
    FormsModule,
  ]
})
export class ReleaseNotesComponent {
  @Input() entry!: number;
  @Input() bullets!: string[];
  entries = RELEASE_ENTRIES;
  icons = RELEASE_ENTRIES_ICONS;
}
