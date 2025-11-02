import {Component, Inject, inject, OnInit} from '@angular/core';
import {
  AuthService,
  CompanyService,
  CrudService, NotificationService,
  PlaybookService,
  ProfileService,
  TeamService,
  TicketService,
} from '@shared/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {
  ADMIN_NOTIFICATION_BUSINESS_SETUP_ISSUE,
  MEMBERS,
  PLAYBOOK_TOPICS,
  PROFILES,
  TRANSACTIONS, TRIAL_AI_TX, TRIAL_GB_TX
} from '@shared/constants';
import {EmailNotification, Entity, Transaction} from '@shared/interfaces';
import {SubscriptionService} from '@shared/services/subscription.service';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatProgressBar} from '@angular/material/progress-bar';
import {WELCOME} from '@shared/animations/welcome';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {Router} from '@angular/router';

interface Step {
  icon: string;
  label: string;
  message: string;
  completed: boolean;
  failed: boolean;
}

@Component({
  selector: 'lib-business-setup',
  imports: [
    NgForOf,
    MatIcon,
    MatProgressSpinner,
    NgIf,
    MatDialogContent,
    MatProgressBar,
    MatButton,
    MatDialogClose,
    MatDivider
  ],
  templateUrl: './business-setup.component.html',
  standalone: true,
  styleUrl: './business-setup.component.scss',
  animations: [WELCOME]
})
export class BusinessSetupComponent implements OnInit {
  private companyService = inject(CompanyService);
  protected teamService = inject(TeamService);
  protected ticketService = inject(TicketService);
  protected playbookService = inject(PlaybookService);
  protected profileService = inject(ProfileService);
  protected subscriptionService = inject(SubscriptionService);
  protected notificationService = inject(NotificationService);
  protected snackBar = inject(MatSnackBar);
  protected authService = inject(AuthService);
  protected router = inject(Router);
  protected crudService = inject(CrudService);
  public dialogRef = inject(MatDialogRef<BusinessSetupComponent>);

  steps: Step[] = [
    {
      icon: 'account_balance',
      label: 'Creating company',
      message: 'You may complete the company details later.',
      completed: false,
      failed: false
    },
    {
      icon: 'groups_2',
      label: 'Initializing team',
      message: 'Teams can be generated or selected from the available templates.',
      completed: false,
      failed: false
    },
    {
      icon: 'table_chart',
      label: 'Setting up kanban board',
      message: 'We just added a welcome ticket to your kanban board.',
      completed: false,
      failed: false
    },
    {
      icon: 'book_2',
      label: 'Creating playbook',
      message: 'Playbook instructs your employees what to do and how to do it.',
      completed: false,
      failed: false
    },
    {
      icon: 'loyalty',
      label: 'Activating Pro plan',
      message: 'You are on a Pro plan with 4 weeks free access to everything.',
      completed: false,
      failed: false
    }
  ];

  headline = 'Welcome to Write The Future!';
  headlineState = 'center';
  caption = 'We are creating your account. Please wait.';
  message = '';
  companyPathId!: string;
  teamPath!: string;
  playbookPath!: string;
  profilePath!: string;
  persona!: Entity;
  started = false;
  icon = "";
  txAI: Transaction = TRIAL_AI_TX;
  txGB: Transaction = TRIAL_GB_TX;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    if (!this.data.isNewProfile) {
      this.headline = 'We are adding your company!';
      this.caption = 'Please wait.';
    }
  }

  async ngOnInit() {
    setTimeout(() => this.headlineState = 'top', 1800);
    setTimeout(() => this.started = true, 2000);
    this.headlineState = 'top';
    this.started = true;
    if (!await this.setup(0, () => this.setupCompany())) return;
    if (!await this.setup(1, () => this.setupTeam())) return;
    if (!await this.setup(2, () => this.setupKanban())) return;
    if (!await this.setup(3, () => this.setupPlaybook())) return;
    if (!await this.setup(4, () => this.setupPlan())) return;

    // Only new profiles get free trial credits
    if (this.data.isNewProfile) {
      const tag = this.profileService.tag();
      console.log(tag, this.profileService.profile());
      this.txAI.to = tag;
      this.txGB.to = tag;
      await this.crudService.add(`${this.profilePath}/${TRANSACTIONS.path}`, this.txAI);
      await this.crudService.add(`${this.profilePath}/${TRANSACTIONS.path}`, this.txGB);
    }
  }

  private async setup(index: number, stepFunction: () => Promise<boolean>) {
    this.icon = this.steps[index].icon;
    this.message = this.steps[index].message;

    const result = await stepFunction();
    setTimeout(() => {
      this.steps[index].completed = result;
      this.steps[index].failed = !result;
      console.log(`After timeout for step ${index}`);
    }, 100);

    return result;
  }

  private async setupCompany() {
    this.boost();
    const companyRef = await this.companyService.addCompany();
    if (!companyRef) {
      await this.notify('adding company.');
      return false;
    }
    this.boost();
    this.initPaths(companyRef.id);
    await new Promise(res => setTimeout(res, 2100)); // Simulating async operation
    this.boost();
    return true;
  }

  private async notify(step: string) {
    this.message = `There is an issue with ${step}.`;
    this.snackBar.open(`Admin is informed about this issue.`, 'X', {duration: 10000});
    const notification: EmailNotification = {...ADMIN_NOTIFICATION_BUSINESS_SETUP_ISSUE};
    notification.message.html = notification.message.html
      .replace('[ProfileId]', this.profileService.profileId())
      .replace('[IssueStep]', step);

    console.log(
      notification,
      this.profileService.profileId(),
      step
    );
    await this.notificationService.notify(notification);
  }

  private async setupTeam() {
    this.persona = {
      role: this.profileService.profileId(),
      name: this.profileService.displayName() || '',
      avatar: this.profileService.avatar()
    };
    console.log(this.persona);
    const memberRef = await this.teamService.setDefaultMember(this.teamPath, this.persona);
    this.boost();
    if (!memberRef) {
      await this.notify('creating team.');
      return false;
    }
    await new Promise(res => setTimeout(res, 2200)); // Simulating async operation
    this.boost();
    return true;
  }

  private async setupKanban() {
    const ticketRef =
      await this.ticketService.initKanbanBoard(this.companyPathId);
    this.boost();
    if (!ticketRef) {
      await this.notify('adding kanban.');
      return false;
    }
    await new Promise(res => setTimeout(res, 2300)); // Simulating async operation
    this.boost();
    return true;
  }

  private async setupPlaybook() {
    const playbookRef =
      await this.playbookService.setDefaultPlaybook(this.playbookPath, this.persona);
    this.boost();
    if (!playbookRef) {
      await this.notify('adding playbook.');
      return false;
    }
    await new Promise(res => setTimeout(res, 2400)); // Simulating async operation
    this.boost();
    return true;
  }

  private async setupPlan() {
    // const planRef =
    //   await this.subscriptionService.addSubscription(this.companyPathId, PlanType.Free);
    // this.boost();
    // if (!planRef) {
    //   await this.notify('adding free plan.');
    //   return false;
    // }
    // await new Promise(res => setTimeout(res, 3000)); // Simulating async operation
    // this.boost();
    return true;
  }

  initPaths(id: string): void {
    this.companyPathId = `${this.companyService.path()}/${id}`;
    this.teamPath = `${this.companyPathId}/${MEMBERS.path}`;
    this.playbookPath = `${this.companyPathId}/${PLAYBOOK_TOPICS.path}`;
    this.profilePath = `${PROFILES.path}/${this.profileService.profileId()}`;
  }

  isActive(index: number): boolean {
    return !this.steps[index].completed && !this.steps[index].failed && (index === 0 || this.steps[index - 1].completed);
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigate(['/']);
  }

  private progressBoost = 0;

  get progress(): number {
    const completedSteps = this.steps.filter(step => step.completed).length;
    return (completedSteps / this.steps.length) * 100 + this.progressBoost;
  }

  boost(): void {
    this.progressBoost += Math.floor(Math.random() * 3); // Random small boost
  }

  get allDone(): boolean {
    const completedSteps = this.steps.filter(step => step.completed).length;
    const done = completedSteps === this.steps.length;
    if (done)
      setTimeout(() => this.dialogRef.close(), 2500);
    return done;
  }

  failedStep: string = "";

  get issue(): boolean {
    const failedStep = this.steps.find(step => step.failed)
    this.failedStep = failedStep ? failedStep.label : "";
    return !!failedStep;
  }
}
