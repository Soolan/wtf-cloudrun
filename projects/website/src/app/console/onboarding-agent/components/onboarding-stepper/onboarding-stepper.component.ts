import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatStepperModule} from "@angular/material/stepper";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatRadioModule} from "@angular/material/radio";
import {MatTreeModule, MatTreeNestedDataSource} from "@angular/material/tree";
import {NestedTreeControl} from "@angular/cdk/tree";
import { MatIconModule } from '@angular/material/icon';
import { CompanyService, FunctionsService, StorageService } from '@shared/services';
import { Auth } from '@angular/fire/auth';
import { FileUploaderComponent } from '@shared/components/file-uploader/file-uploader.component';
import { LOGO_MEDIA, BANNER_MEDIA } from '@shared/constants';
import {Uploader} from '@shared/interfaces';
import { Router } from '@angular/router';

export interface TeamNode {
  jobTitle: string;
  name: string;
  isEditing?: boolean;
  children?: TeamNode[];
}

@Component({
  selector: 'app-onboarding-stepper',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    ReactiveFormsModule,
    FormsModule, // Add FormsModule for ngModel
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTreeModule,
    MatIconModule,
    FileUploaderComponent
  ],
  templateUrl: './onboarding-stepper.component.html',
  styleUrl: './onboarding-stepper.component.scss'
})
export class OnboardingStepperComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private storageService = inject(StorageService);
  private functionsService = inject(FunctionsService);
  private auth: Auth = inject(Auth);
  private router = inject(Router);

  // Loading states
  isSuggestingTeam = false;
  isUploadingKnowledge = false;
  isScrapingUrl = false;
  isInstallingPack = false;

  // Error states
  teamSuggestionError: string | null = null;
  knowledgeUploadError: string | null = null;
  scrapeUrlError: string | null = null;
  installPackError: string | null = null;

  // Success states
  teamSuggestionSuccess = false;
  knowledgeUploadSuccess = false;
  scrapeUrlSuccess = false;
  installPackSuccess = false;
  finalizeOnboardingLoading = false;
  finalizeOnboardingError: string | null = null;

  // Stepper Forms
  firstFormGroup: FormGroup = this._formBuilder.group({ companyName: ['', Validators.required] });
  secondFormGroup: FormGroup = this._formBuilder.group({ industry: ['', Validators.required] });
  thirdFormGroup: FormGroup = this._formBuilder.group({ teamApproved: [false] });
  fourthFormGroup: FormGroup = this._formBuilder.group({ brandingOption: ['upload'] });
  fifthFormGroup: FormGroup = this._formBuilder.group({
    knowledgeOption: ['file'],
    knowledgeUrl: ['', Validators.pattern('https?://.*')]
  });

  // Tree Logic
  treeControl = new NestedTreeControl<TeamNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TeamNode>();

  // State Properties
  logoUrl: string | null = null;
  bannerUrl: string | null = null;
  knowledgeFileName: string | null = null;

  // Media Types for File Uploader
  logoMediaType = LOGO_MEDIA;
  bannerMediaType = BANNER_MEDIA;

  get assetsPath(): string {
    const companyId = this.companyService.id();
    const user = this.auth.currentUser;
    if (!companyId || !user) {
      return '';
    }
    return `profiles/${user.uid}/companies/${companyId}/assets`;
  }

  ngOnInit() {
    this.dataSource.data = [];
    this.fifthFormGroup.get('knowledgeOption')?.valueChanges.subscribe(() => {
      this.resetKnowledgeStates();
    });
  }

  resetKnowledgeStates(): void {
    this.knowledgeUploadError = null;
    this.knowledgeUploadSuccess = false;
    this.scrapeUrlError = null;
    this.scrapeUrlSuccess = false;
    this.installPackError = null;
    this.installPackSuccess = false;
  }

  hasChild =
    (_: number, node: TeamNode) => !!node.children && node.children.length > 0;

  async suggestTeam() {
    this.isSuggestingTeam = true;
    this.teamSuggestionError = null;
    this.teamSuggestionSuccess = false;
    const industry = this.secondFormGroup.value.industry;
    try {
      const result = await this.functionsService.call<{ industry: string }, { team: TeamNode[] }>(
        'generateTeam',
        { industry }
      );
      if (result?.team) {
        this.dataSource.data = result.team;
        this.expandNodes(result.team);
        this.teamSuggestionSuccess = true;
      } else {
        throw new Error('The response from the server was empty. Please try again');
      }
    } catch (err: any) {
      console.error('Error calling generateTeam function:', err);
      this.teamSuggestionError = err.message || 'An unknown error occurred.';
      // The service already shows a snackbar, so just log the error.
    } finally {
      this.isSuggestingTeam = false;
    }
  }

  expandNodes(nodes: TeamNode[]) {
    nodes.forEach(node => {
      if (node.children) {
        this.treeControl.expand(node);
        this.expandNodes(node.children);
      }
    });
  }

  toggleEdit(node: TeamNode): void {
    node.isEditing = !node.isEditing;
  }

  onLogoUpload(event: Uploader) {
    if (event.downloadURL) {
      this.logoUrl = event.downloadURL;
    }
  }

  onBannerUpload(event: Uploader) {
    if (event.downloadURL) {
      this.bannerUrl = event.downloadURL;
    }
  }

  // --- Knowledge Methods ---
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploadingKnowledge = true;
    this.knowledgeUploadError = null;
    this.knowledgeUploadSuccess = false;

    const companyId = this.companyService.id();
    const user = this.auth.currentUser;
    if (!companyId || !user) {
      this.knowledgeUploadError = 'Company ID or user not available. Please ensure you are logged in and have selected a company.';
      this.isUploadingKnowledge = false;
      return;
    }
    const profileId = user.uid;
    const path = `profiles/${profileId}/companies/${companyId}/knowledge/${file.name}`;

    try {
      const storageRef = this.storageService.getRef(path);
      await this.storageService.upload(storageRef, file);
      this.knowledgeFileName = file.name;
      this.knowledgeUploadSuccess = true;
    } catch (err: any) {
      console.error('Error uploading knowledge file:', err);
      this.knowledgeUploadError = err.message || 'Could not upload the file. Please try again.';
    } finally {
      this.isUploadingKnowledge = false;
    }
  }

  clearKnowledgeFile(): void {
    this.knowledgeFileName = null;
  }

  async finalizeOnboarding() {
    this.finalizeOnboardingLoading = true;
    this.finalizeOnboardingError = null;

    const companyName = this.firstFormGroup.value.companyName;
    const industry = this.secondFormGroup.value.industry;
    const teamStructure = this.dataSource.data;
    const logoUrl = this.logoUrl;
    const bannerUrl = this.bannerUrl;
    const knowledgeOption = this.fifthFormGroup.value.knowledgeOption;
    const knowledgeFileName = this.knowledgeFileName;
    const knowledgeUrl = this.fifthFormGroup.value.knowledgeUrl;

    try {
      const result = await this.functionsService.call<{ companyName: string, industry: string, teamStructure: TeamNode[], logoUrl: string | null, bannerUrl: string | null, knowledgeOption: string, knowledgeFileName?: string, knowledgeUrl?: string }, { companyId: string }>(
        'finalizeCompanySetup',
        {
          companyName,
          industry,
          teamStructure,
          logoUrl,
          bannerUrl,
          knowledgeOption,
          ...(knowledgeOption === 'file' && knowledgeFileName && { knowledgeFileName }),
          ...(knowledgeOption === 'link' && knowledgeUrl && { knowledgeUrl }),
        }
      );

      if (result?.companyId) {
        // Redirect to the new company's dashboard
        await this.router.navigate(['/console/company', result.companyId, 'dashboard']);
      } else {
        throw new Error('Company ID not returned from finalization.');
      }
    } catch (err: any) {
      console.error('Error finalizing onboarding:', err);
      this.finalizeOnboardingError = err.message || 'Failed to finalize company setup.';
    } finally {
      this.finalizeOnboardingLoading = false;
    }
  }

  async scrapeAndProcessUrl() {
    if (this.fifthFormGroup.invalid) {
      return;
    }
    this.isScrapingUrl = true;
    this.scrapeUrlError = null;
    this.scrapeUrlSuccess = false;
    const url = this.fifthFormGroup.value.knowledgeUrl;
    const companyId = this.companyService.id();

    try {
      await this.functionsService.call('scrapeAndProcess', { url, companyId });
      this.scrapeUrlSuccess = true;
    } catch (err: any) {
      console.error('Error calling scrapeAndProcess function:', err);
      this.scrapeUrlError = err.message || 'Could not process the URL. Please check the link and try again.';
    } finally {
      this.isScrapingUrl = false;
    }
  }

  async installStarterPack() {
    this.isInstallingPack = true;
    this.installPackError = null;
    this.installPackSuccess = false;
    const companyId = this.companyService.id();
    const packName = 'default'; // For now, we'll use a default pack

    try {
      await this.functionsService.call('installStarterPack', { companyId, packName });
      this.installPackSuccess = true;
    } catch (err: any) {
      console.error('Error calling installStarterPack function:', err);
      this.installPackError = err.message || 'Could not install the starter pack. Please try again.';
    } finally {
      this.isInstallingPack = false;
    }
  }
}
