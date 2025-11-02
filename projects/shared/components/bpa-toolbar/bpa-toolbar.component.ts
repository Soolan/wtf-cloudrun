import { ChangeDetectionStrategy, Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar'; // Import MatToolbarModule
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule

@Component({
  selector: 'lib-bpa-toolbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule], // Add Material modules
  templateUrl: './bpa-toolbar.component.html',
  styleUrls: ['./bpa-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BpaToolbarComponent {
  @Output() save = new EventEmitter<void>();
  @Output() run = new EventEmitter<void>();
  @Output() importFile = new EventEmitter<File>();
  @Output() export = new EventEmitter<void>();

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.importFile.emit(fileList[0]);
      element.value = ''; // Clear the input after file selection
    }
  }
}
