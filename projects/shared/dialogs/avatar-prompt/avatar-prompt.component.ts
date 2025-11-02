import {Component, Inject, inject, OnInit, signal} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import {AvatarPromptFormService} from '@shared/forms';
import {StorageService, VertexAiService} from '@shared/services';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {AvatarPrompt} from '@shared/interfaces';
import {AVATAR_PROMPT} from '@shared/constants';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MediaCategory, PersonaEthnicity, PersonaOutfit} from '@shared/enums';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatChipsModule} from '@angular/material/chips';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {CommonModule} from '@angular/common';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'lib-avatar-prompt',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatSnackBarModule,
    MatProgressBar
  ],

  templateUrl: './avatar-prompt.component.html',
  standalone: true,
  styleUrl: './avatar-prompt.component.scss'
})
export class AvatarPromptComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<AvatarPromptComponent>);
  private formService = inject(AvatarPromptFormService);
  private vertexAiService = inject(VertexAiService);
  private storageService = inject(StorageService);
  private snackbar = inject(MatSnackBar)

  generated = signal<boolean>(false);
  generating = signal<boolean>(false);
  message = signal<string>('');
  avatarUrl = signal<string>('');

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: string[] = [];
  ethnicities = Object.values(PersonaEthnicity);
  outfits = Object.values(PersonaOutfit);
  base64Image!: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.form.reset();
    this.formService.form.patchValue(this.avatarPrompt);
    this.initTags();
    this.valueChanges();
  }

  private initTags() {
    if (this.tags[this.tags.length - 1] === '') this.tags.pop(); // remove blank details tag
    this.updateTag(0, `A ${this.tags[0]}`)
    this.updateTag(3, `${this.tags[3]} years old`)
    this.updateTag(4, `wearing a ${this.tags[4]} outfit`)
  }

  private valueChanges() {
    this.form.get('gender')?.valueChanges
      .subscribe((value: string) => this.updateTag(0, `A ${value}`));
    this.form.get('ethnicity')?.valueChanges
      .subscribe((value: PersonaEthnicity) => this.updateTag(2, value));
    this.form.get('age')?.valueChanges
      .subscribe((value: number) => this.updateTag(3, `${value} years old`));
    this.form.get('outfit')?.valueChanges
      .subscribe((value: PersonaOutfit) => this.updateTag(4, `wearing a ${value} outfit`));
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
    this.message.set('Generating the avatar...')

    const response = await this.vertexAiService.generateImage(
      this.data.filePath,
      this.tags.toString(),
      MediaCategory.Avatar
    );
    if (response.success) {
      const bustCacheUrl = `${response.imageUrl}?t=${Date.now()}`;
      this.avatarUrl.set(bustCacheUrl);

      // this.avatarUrl.set(response.imageUrl);
    } else {
      this.snackbar.open(response.message, 'X', {duration: 5000});
    }

    this.generating.set(false);
    this.generated.set(true);
  }

  pick() {
    const data = {
      success: true,
      avatarPath: this.data.filePath.replace(/-original\.webp$/, "-resized.webp"),
      avatarUrl: this.avatarUrl()
    }
    this.dialogRef.close(data);
  }

  get avatarPrompt(): AvatarPrompt {
    if (!this.data.prompt) {
      this.tags = [
        AVATAR_PROMPT.gender, AVATAR_PROMPT.lensPurpose,
        AVATAR_PROMPT.ethnicity, AVATAR_PROMPT.age.toString(),
        AVATAR_PROMPT.outfit, AVATAR_PROMPT.details || ''
      ];
      return AVATAR_PROMPT;
    }
    this.tags = this.data.prompt.split(',') || [];
    const [gender, lensPurpose, ethnicity, age, outfit, details = ''] = this.tags;
    return {
      gender, lensPurpose, ethnicity: ethnicity as PersonaEthnicity,
      age: parseInt(age), outfit: outfit as PersonaOutfit, details,
    };
  }

  get form(): FormGroup {
    return this.formService.form;
  }

}
