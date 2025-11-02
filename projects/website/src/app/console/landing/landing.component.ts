import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {CompanyFormService} from '@shared/forms';
import {CompanyService, CrudService, LayoutVisibilityService, ProfileService, TicketService} from '@shared/services';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Company, CompanyWithId, TicketWithId} from '@shared/interfaces';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {NgForOf, NgIf} from '@angular/common';
import {FileUploaderComponent, LoadingComponent} from '@shared/components';
import {BANNER_MEDIA, LOGO_MEDIA, PLAN_QUOTA, TICKETS} from '@shared/constants';
import {Currency, Plan, ProgressMode, ProgressType} from '@shared/enums';
import {ActivatedRoute} from '@angular/router';
import {StorageUrlPipe} from '@shared/pipes';
import {firstValueFrom} from 'rxjs';
import {DoughnutChartComponent} from '@shared/components/doughnut-chart/doughnut-chart.component';
import {SubscriptionService} from '@shared/services/subscription.service';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-landing',
  imports: [
    FileUploaderComponent,
    FormsModule,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    NgIf,
    ReactiveFormsModule,
    FileUploaderComponent,
    LoadingComponent,
    NgForOf,
    DoughnutChartComponent,
    MatDivider,
  ],
  templateUrl: './landing.component.html',
  standalone: true,
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  private crud = inject(CrudService);
  private route = inject(ActivatedRoute);
  private storageUrl = inject(StorageUrlPipe);
  private ticketService = inject(TicketService);
  private profileService = inject(ProfileService);
  private companyService = inject(CompanyService);
  private companyForm = inject(CompanyFormService);
  private subscriptionService = inject(SubscriptionService);
  private layoutService = inject(LayoutVisibilityService);

  /** Signals for reactive state */
    // companyId = this.companyService.id;
    // path = this.companyService.path;
  logo = signal<string>('');
  banner = signal<string>('');
  loading = signal<boolean>(true);
  company = this.companyService.selectedCompany;
  path = signal<string>('');

  editing = {
    banner: false,
    logo: false,
    name: false,
    description: false,
  };

  saving = {
    name: false,
    description: false,
  };

  tasks: TicketWithId[] = [];
  avatarMap = new Map<string, string>();

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        if (this.company()) {
          this.form.reset();
          const company = this.company() as CompanyWithId;
          this.logo.set(company.logo);
          this.banner.set(company.banner);
          this.loading.set(false);
          this.form.patchValue(company);
          this.path.set(`${this.companyService.path()}/${company.id}`);
        } else {
          const id = this.route.snapshot.paramMap.get('companyId');
          if (!id) return;
          const company = await this.crud.getDoc(this.companyService.path(), id);
          this.companyService.updateCompany({id, ...company});
          this.path.set(`${this.companyService.path()}/${company.id})`);
        }
        this.tasks = await this.ticketService.tasksOfTheDay(`${this.path()}/${TICKETS.path}`);
        await this.setAvatars();
      }
    });
  }

  ngOnInit() {
  }

  async setAvatars(): Promise<void> {
    for (const task of this.tasks) {
      const creator = task.creator?.avatar;
      const assignee = task.assignedTo?.avatar;

      if (creator) {
        const creatorStyle = await this.getAvatarStyle(creator);
        this.avatarMap.set(creator, creatorStyle);
      }

      if (assignee) {
        const assigneeStyle = await this.getAvatarStyle(assignee);
        this.avatarMap.set(assignee, assigneeStyle);
      }
    }
  }

  /** Get DTO and update service */
  private getDTO(): Company {
    const data = this.form.value as Company;
    data.timestamps.updated_at = Date.now();
    console.log(data);
    this.companyService.updateCompany({id: this.companyService.id(), ...data});
    return data;
  }

  /** Update a specific field */
  async update(field: string): Promise<void> {
    // @ts-ignore
    this.saving[field] = true;
    this.crud.update(this.companyService.path(), this.companyService.id(), this.getDTO())
      .then(_ => this.done())
      .catch(error => console.error("Update failed:", error));
  }

  /** Update image fields (logo/banner) */
  async updateImage(event: any, field: 'logo' | 'banner'): Promise<void> {
    console.log(event);
    if (field === 'logo') {
      this.logo.set(event.filePath);
      this.editing.logo = !this.logo();
      this.form.patchValue({logo: event.filePath});
    } else {
      this.banner.set(event.filePath);
      console.log(this.banner())
      this.editing.banner = !this.banner();
      this.form.patchValue({banner: event.filePath});
    }
    await this.crud.update(this.companyService.path(), this.companyService.id(), this.getDTO());
  }

  /** Reset UI state */
  private done(): void {
    this.editing = {banner: false, logo: false, name: false, description: false};
    this.saving = {name: false, description: false};
  }

  settings(): void {
  }

  /** Getter for the form */
  get form(): FormGroup {
    return this.companyForm.form;
  }

  async getAvatarStyle(avatar?: string | null | undefined): Promise<string> {
    if (!avatar)
      return 'repeating-linear-gradient(90deg, #e0e0e0, #e0e0e0 10px, #f5f5f5 10px, #f5f5f5 20px)';

    if (this.avatarMap.has(avatar)) {
      return `url(${this.avatarMap.get(avatar)})`;
    }

    try {
      const url = await firstValueFrom(this.storageUrl.transform(avatar));
      this.avatarMap.set(avatar, url);
      return `url(${url})`;
    } catch {
      return 'repeating-linear-gradient(90deg, #e0e0e0, #e0e0e0 10px, #f5f5f5 10px, #f5f5f5 20px)';
    }
  }

  getQuota(currency: Currency): number {
    const plan = this.profileService.currentPlan()?.plan || Plan.Free;
    return PLAN_QUOTA[plan]?.[currency] ?? 0
  }

  getUsage(currency: Currency): number {
    const balances = this.profileService.balances();
    const used = balances.find(b => b.currency === currency)?.amount || 0;
    const usage = this.getQuota(currency) - used;

    const decimals = usage.toString().split('.')[1]?.length || 0;
    if (decimals > 4) {
      return parseFloat(usage.toFixed(4));
    }

    return usage;
  }

  protected readonly BANNER_MEDIA = BANNER_MEDIA;
  protected readonly LOGO_MEDIA = LOGO_MEDIA;
  protected readonly ProgressType = ProgressType;
  protected readonly ProgressMode = ProgressMode;
  protected readonly Currency = Currency;
}

