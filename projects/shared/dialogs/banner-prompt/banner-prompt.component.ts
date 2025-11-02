import {Component, Inject, inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {BannerPromptFormService} from '@shared/forms';
import {CompanyService, VertexAiService} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {BackgroundStyle, MediaCategory} from '@shared/enums';
import {BannerPrompt} from '@shared/interfaces';
import {BANNER_PROMPT} from '@shared/constants';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatChipGrid, MatChipInput, MatChipRemove, MatChipRow} from '@angular/material/chips';
import {MatDivider} from '@angular/material/divider';
import {MatFormField, MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {MatProgressBar} from '@angular/material/progress-bar';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'lib-banner-prompt',
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
    MatProgressBar,
  ],
  templateUrl: './banner-prompt.component.html',
  standalone: true,
  styleUrl: './banner-prompt.component.scss'
})

export class BannerPromptComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<BannerPromptComponent>);
  private formService = inject(BannerPromptFormService);
  private vertexAiService = inject(VertexAiService);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  private snackbar = inject(MatSnackBar)

  generated = signal<boolean>(false);
  generating = signal<boolean>(false);
  message = signal<string>('');
  bannerUrl = signal<string>('');

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: string[] = [];
  styles = Object.values(BackgroundStyle);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    console.log(this.data);
    this.form.reset();
    this.formService.form.patchValue(this.bannerPrompt);
    this.initTags();
    this.valueChanges();
  }

  private initTags() {
    if (this.tags[this.tags.length - 1] === '') this.tags.pop(); // remove blank details tag
    this.updateTag(0, `${this.tags[0]} banner`);
    this.updateTag(1, `for a ${this.tags[1]} company`);
  }

  private valueChanges() {
    this.form.get('style')?.valueChanges
      .subscribe((value: BackgroundStyle) => this.updateTag(0, `${value} banner`));
    this.form.get('business')?.valueChanges
      .subscribe((value: string) => this.updateTag(1, `for a ${value} company`));
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
    this.message.set('Generating the banner...');
    const path = this.data.filePath || this.filePath;
    const prompt = this.tags.toString();
    const response = await this.vertexAiService.generateImage(path, prompt, MediaCategory.Banner);
    this.generating.set(false);

    if (response.success) {
      const bustCacheUrl = `${response.imageUrl}?t=${Date.now()}`;
      this.bannerUrl.set(bustCacheUrl);
      this.generated.set(true);
    } else {
      this.snackbar.open(response.message, 'X', {duration: 5000});
      console.log(response.message);
    }
  }

  pick() {
    const data = {
      success: true,
      bannerPath: this.data.filePath.replace(/-original\.webp$/, "-resized.webp"),
      bannerUrl: this.bannerUrl()
    }
    this.dialogRef.close(data);
  }

  get bannerPrompt(): BannerPrompt {
    if (!this.data.prompt) {
      this.tags = [BANNER_PROMPT.style, BANNER_PROMPT.business, BANNER_PROMPT.details || ''];
      return BANNER_PROMPT;
    }
    this.tags = this.data.prompt.split(',') || [];
    const [style, business, details = ''] = this.tags;
    return {style: style as BackgroundStyle, business, details};
  }

  get form(): FormGroup {
    return this.formService.form;
  }

  get filePath(): string {
    if (!this.companyService.path() || !this.companyService.id()) {
      this.snackbar.open('Initializing the missing path');
      this.companyService.updatePath();
      const id = this.route.snapshot.paramMap.get('companyId') || '';
      id? this.companyService.id.set(id): this.snackbar.open('Company id is missing in the current route.');
    }

    const timestamp = Math.floor(Date.now() / 1000); // now in seconds
    const file = `${MediaCategory.Banner.toLowerCase()}-${timestamp}-original.webp`;
    return `${this.companyService.path()}/${this.companyService.id()}/${file}`;
  }
}
