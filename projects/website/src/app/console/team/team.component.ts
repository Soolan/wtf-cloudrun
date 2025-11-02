import {Component, signal, inject, effect} from '@angular/core';
import {CompanyService, LayoutVisibilityService, TeamService} from '@shared/services';
import {MemberWithId} from '@shared/interfaces';
import {NEW_MEMBER, PLAYBOOK_TOPICS} from '@shared/constants';
import {KeyValuePipe, NgForOf, NgIf} from '@angular/common';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import {MatFabButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MemberComponent} from './member/member.component';
import {LoadingComponent} from '@shared/components';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    MatIcon,
    MatAccordion,
    MatExpansionModule,
    KeyValuePipe,
    MatFabButton,
    RouterLink,
    MemberComponent,
    LoadingComponent,
    MatTooltip
  ]
})
export class TeamComponent {
  protected teamService = inject(TeamService);
  private companyService = inject(CompanyService);
  protected layoutService = inject(LayoutVisibilityService);

  // Reactive Signals
  board = signal<MemberWithId[]>([]);
  cSuite = signal<MemberWithId[]>([]);
  departments = signal<Record<string, MemberWithId[]>>({});

  hoveredCSuite = signal<MemberWithId | null>(null);
  hoveredTeam = signal<string | null>(null);
  selectedCSuite = signal<MemberWithId | null>(null);
  selectedTeam = signal<string | null>(null);

  path!:string;

  constructor() {
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        this.path = `${this.companyService.path()}/${this.companyService.id()}/team`;
        this.initMembers();
      }
    });
  }

  initMembers() {
    this.teamService.initMembers(this.path).then(() => {
      this.board.set(this.teamService.boardMembers());
      this.cSuite.set(this.teamService.cSuiteMembers());
      this.departments.set(this.teamService.departmentMembers());
    });
  }

  onSelectTeam(department: string): void {
    if (this.selectedTeam() === department) {
      this.selectedTeam.set(null);
      this.selectedCSuite.set(null);
    } else {
      this.selectedTeam.set(department);
      const csuiteMember = this.cSuite().find(member => member.department === department) || null;
      this.selectedCSuite.set(csuiteMember);
    }
  }

  onSelectCSuite(member: MemberWithId): void {
    if (this.selectedCSuite()?.id === member.id) {
      this.selectedCSuite.set(null);
      this.selectedTeam.set(null);
    } else {
      if (this.selectedTeam()) {
        // The ! tells TypeScript: "Trust me bro, this value will never be null."
        this.expandTeam(this.selectedTeam()!, false);
      }
      this.selectedCSuite.set(member);
      this.expandTeam(member.department, true);
    }
  }

  expandTeam(department: string, expanded: boolean): void {
    if (expanded) {
      // Open the specified department and highlight the associated C-suite
      this.selectedTeam.set(department);
      // Highlight the associated C-suite when expanding the team
      const cSuite =
        this.cSuite().find((member) => member.department === department) || null;
      this.selectedCSuite.set(cSuite);
    } else {
      // Collapse the currently selected department
      if (this.selectedTeam() === department) {
        this.selectedTeam.set(null);
        this.selectedCSuite.set(null); // Un-highlight the C-suite when collapsing the team
      }
    }
  }

  protected readonly NEW_MEMBER = NEW_MEMBER;
}
