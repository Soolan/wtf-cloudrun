import {Component, effect, inject, signal} from '@angular/core';
import {Member} from '@shared/interfaces';
import {AuthService, CompanyService, CrudService, LayoutVisibilityService, ProfileService} from '@shared/services';
import {ActivatedRoute} from '@angular/router';
import {BLANK_MEMBER, MEMBERS, NEW_MEMBER, PROFILE} from '@shared/constants';
import {MatTabsModule} from '@angular/material/tabs';
import {MemberTabComponent} from './member-tab/member-tab.component';
import {User} from '@angular/fire/auth';
import {ProfileTabComponent} from './profile-tab/profile-tab.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.scss',
  standalone: true,
  imports: [
    MatTabsModule,
    MemberTabComponent,
    ProfileTabComponent,
    NgIf
  ]
})
export class MemberEditComponent {
  user!: User | null;
  memberId!: string;
  companyId!: string;

  member = signal<Member| null>(null);

  private crud = inject(CrudService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private companyService = inject(CompanyService);
  private layoutService = inject(LayoutVisibilityService);

  constructor() {
    this.user = this.authService.auth.currentUser;
    effect(async () => {
      if (this.layoutService.headerIsReady()) {
        this.memberId = this.route.snapshot.paramMap.get('memberId') || '';
        this.companyId = this.route.snapshot.paramMap.get('companyId') || '';
        if (this.memberId === NEW_MEMBER) {
          this.member.set(BLANK_MEMBER);
          this.profileService.profile.set(PROFILE);
        } else if (this.companyService.path() && this.companyId) {
          this.member.set(await this.crud.getDoc(this.path, this.memberId));
        }
      }
    });
  }

  get isAdminProfile(): boolean {
    return this.user?.uid === this.member()?.persona.role;
  }

  get path(): string {
    return `${this.companyService.path()}/${this.companyId}/${MEMBERS.path}`;
  }
}
