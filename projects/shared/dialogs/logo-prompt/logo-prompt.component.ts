import {Component, Inject, inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {LogoPromptFormService} from '@shared/forms';
import {VertexAiService} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {BackgroundStyle, LogoStyle, MediaCategory} from '@shared/enums';
import {LogoPrompt} from '@shared/interfaces';
import {LOGO_PROMPT} from '@shared/constants';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatChipGrid, MatChipInput, MatChipRemove, MatChipRow} from '@angular/material/chips';
import {MatDivider} from '@angular/material/divider';
import {MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'lib-logo-prompt',
  imports: [
    MatButton,
    MatChipGrid,
    MatChipInput,
    MatChipRemove,
    MatChipRow,
    MatDialogClose,
    MatDivider,
    MatFormFieldModule,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    MatProgressBar
  ],
  templateUrl: './logo-prompt.component.html',
  standalone: true,
  styleUrl: './logo-prompt.component.scss'
})
export class LogoPromptComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<LogoPromptComponent>);
  private formService = inject(LogoPromptFormService);
  private vertexAiService = inject(VertexAiService);
  private snackbar = inject(MatSnackBar)

  generated = signal<boolean>(false);
  generating = signal<boolean>(false);
  message = signal<string>('');
  logoUrl = signal<string>('');

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: string[] = [];
  styles = Object.values(LogoStyle);
  backgrounds = Object.values(BackgroundStyle);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.form.reset();
    this.formService.form.patchValue(this.logoPrompt);
    this.initTags();
    this.valueChanges();
  }

  private initTags() {
    if (this.tags[this.tags.length - 1] === '') this.tags.pop(); // remove blank details tag
    this.updateTag(0, `A ${this.tags[0]} logo`);
    this.updateTag(1, `for a ${this.tags[1]} company`);
    this.updateTag(2, `on a ${this.tags[2]} background`);
  }

  private valueChanges() {
    this.form.get('style')?.valueChanges
      .subscribe((value: BackgroundStyle) => this.updateTag(0, `A ${value} logo`));
    this.form.get('business')?.valueChanges
      .subscribe((value: string) => this.updateTag(1, `for a ${value} company`));
    this.form.get('background')?.valueChanges
      .subscribe((value: string) => this.updateTag(2, `on a ${value} background`));
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value) this.tags.push(value);
    event.chipInput!.clear(); // Clear the input value
  }

  deleteTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) this.tags.splice(index, 1);
  }

  updateTag(index: number, newValue: string) {
    if (index < this.tags.length) {
      this.tags[index] = newValue;
    } else {
      this.tags.push(newValue);
    }
  }

  async generate() {
    this.generating.set(true);
    this.message.set('Generating the logo...')

    const response = await this.vertexAiService.generateImage(
      this.data.filePath,
      this.tags.toString(),
      MediaCategory.Logo
    );

    if (response.success) {
      const bustCacheUrl = `${response.imageUrl}?t=${Date.now()}`;
      this.logoUrl.set(bustCacheUrl);
    } else {
      this.snackbar.open(response.message, 'X', {duration: 5000});
    }

    this.generating.set(false);
    this.generated.set(true);
  }

  pick() {
    const data = {
      success: true,
      logoPath: this.data.filePath.replace(/-original\.webp$/, "-resized.webp"),
      logoUrl: this.logoUrl()
    }
    this.dialogRef.close(data);
  }

  get logoPrompt(): LogoPrompt {
    if (!this.data.prompt) {
      this.tags = [LOGO_PROMPT.style, LOGO_PROMPT.business, LOGO_PROMPT.background, LOGO_PROMPT.details || ''];
      return LOGO_PROMPT;
    }
    this.tags = this.data.prompt.split(',') || [];
    const [style, business, background, details = ''] = this.tags;
    return {style: style as LogoStyle, business, background: background as BackgroundStyle, details};
  }

  get form(): FormGroup {
    return this.formService.form;
  }
}

