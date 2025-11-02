import {Component, inject, Input, OnInit, signal} from '@angular/core';
import {Member, Topic, WtfQuery} from '@shared/interfaces';
import {MemberRank, ProgressMode, ProgressType, TopicStatus} from '@shared/enums';
import {
  AVATAR_MEDIA,
  CEO,
  MEMBERS,
  NEW_MEMBER,
  PLAYBOOK_CHAPTERS,
  PROFILE,
  PROFILES
} from '@shared/constants';
import {FileUploaderComponent, LoadingComponent} from '@shared/components';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatInput, MatPrefix} from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {TitleCasePipe} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MemberFormService} from '@shared/forms';
import {CompanyService, CrudService, ProfileService} from '@shared/services';
import {Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-member-tab',
  imports: [
    FileUploaderComponent,
    FormsModule,
    LoadingComponent,
    MatAccordion,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatOptionModule,
    MatPrefix,
    MatRadioButton,
    MatRadioGroup,
    MatSelectModule,
    ReactiveFormsModule,
    TitleCasePipe,
    MatIcon,
    MatInput,
    RouterLink
  ],
  templateUrl: './member-tab.component.html',
  standalone: true,
  styleUrl: './member-tab.component.scss'
})
export class MemberTabComponent implements OnInit {
  @Input() path!: string;
  @Input() member!: Member | null;
  @Input() memberId!: string;
  @Input() companyId!: string;

  departments: string[] = [];
  playbookDepartments: string[] = [];
  avatar!: string;
  selectedDepartment!: string;
  isCEO = signal<boolean>(false);
  avatarChanged = signal<boolean>(false);
  saving = false;
  message = '';
  newProfileId: string = '';
  hierarchy = 'url(assets/images/team/hierarchy-department.png)';
  hasCEO = false;

  private formService = inject(MemberFormService);
  private companyService = inject(CompanyService);
  private profileService = inject(ProfileService);
  private snackbar = inject(MatSnackBar);
  private crud = inject(CrudService);
  private router = inject(Router);

  ngOnInit() {
    if (!this.member) return;
    this.avatar = this.member.persona.avatar || '';
    this.isCEO.set(this.member.department === CEO);
    this.selectedDepartment = this.member.department;
    this.hierarchy = `url(assets/images/team/hierarchy-${this.member.rank.toLowerCase()}.png)`;
    this.initDepartments();
    this.form.patchValue(this.member);
    if (this.isCEO()) {
      this.form.get('type')?.setValue(MemberRank.CSuite);
      this.form.get('department')?.setValue(CEO);
      this.form.get('role')?.setValue(CEO)
    }
    this.form.get('type')?.valueChanges.subscribe(value => {
      this.hierarchy = `url(assets/images/team/hierarchy-${value.toLowerCase()}.png)`;
    });
  }

  async save(): Promise<void> {
    this.saving = true;
    if (this.memberId === NEW_MEMBER) {
      await this.addProfile();
    } else {
      this.message = 'Saving member...';
      await this.crud.update(this.path, this.memberId, this.DTO);
      if (this.avatarChanged())
        await this.profileService.updateAvatar(this.memberId, this.avatar);
    }
    await this.handlePlaybook();
    this.notifyAndReturn();
    this.saving = false;
  }

  private async addProfile() {
    this.message = 'Creating profile...';
    const data = {...PROFILE};
    data.display_name = this.form.get(['persona', 'name'])?.value || this.pId_and_cId;
    data.firstname = data.display_name;
    data.avatar = this.avatar || '';
    data.biography = this.form.get(['bio'])?.value || '';
    const docRef = await this.crud.add(PROFILES.path, data);
    if (!docRef?.id) return;
    this.newProfileId = docRef.id;
    this.message = 'Saving team member...';
    await this.crud.add(this.path, this.DTO);
  }

  notifyAndReturn() {
    this.router.navigate(['console', this.companyId, 'team'])
      .then(_ => {
        this.snackbar.open('Member saved successfully.', 'X', {duration: 3000});
      })
      .catch((error: string) => console.log(error));
    this.saving = false;
    this.message = '';
  }

  async handlePlaybook() {
    const department = this.form.get('department')?.value;
    if (!department) return;
    const isCSuite = this.form.get('type')?.value === MemberRank.CSuite;
    const isNewDepartment = !this.playbookDepartments.includes(department);
    const path = `${this.companyService.path()}/${this.companyId}/playbook`;

    if (isCSuite && isNewDepartment) {
      const data = await this.getTopicDTO(department);
      await this.crud.add(path, data);
      this.snackbar.open('A new section added to the Playbook.', 'X', {duration: 4000});
    }
  }

  async getTopicDTO(department: string): Promise<Topic> {
    const q: WtfQuery = {...PLAYBOOK_CHAPTERS};
    q.path = `${this.companyService.path()}/${this.companyId}/playbook`;

    return {
      title: department,
      kbId: '',
      parentId: '',
      order: await this.crud.countQuery(q),
      status: TopicStatus.Accept,
      creator: {
        role: this.profileService.profileId() ?? this.newProfileId,
        avatar: this.avatar || '',
        name: this.form.get(['persona', 'name'])?.value || this.pId_and_cId
      },
      subtitle: 'Topics for this department are organized here',
      tags: [department],
      timestamps: {created_at: Date.now(), updated_at: Date.now(), deleted_at: 0}
    };
  }

  initDepartments() {
    const q = {...MEMBERS};
    q.path = this.path;
    this.crud.getDocs(q, false, true).then(members => {
      members?.forEach(member => {
        if (!this.hasCEO && member.department === CEO) {
          this.hasCEO = true;
        } else if (!this.departments.includes(member.department)) {
          this.departments.push(member.department);
        }
      });
      this.playbookDepartments = [...this.departments];
    });
  }

  updateImage($event: any) {
    this.form.get(['persona', 'avatar'])?.setValue($event.filePath);
    this.avatar = $event.filePath;
    this.avatarChanged.set(true);
  }


  get DTO(): Member {
    const data: Member = {...this.form.value};
    console.log(data);
    if (this.memberId === NEW_MEMBER) data.persona.role = this.newProfileId;
    if (this.isCEO()) data.department = CEO;
    data.persona.avatar = this.avatar || "";
    data.timestamps.updated_at = Date.now();
    console.log(data);
    return data;
  }

  get teamRoute(): string {
    return `/console/${this.companyId}/team`;
  }

  get pId_and_cId(): string {
    const pId = this.companyService.path().split('/')[1];
    return `Member (profile: ${pId}, company: ${this.companyId})`;
  }

  get form(): FormGroup {
    return this.formService.form;
  }

  protected readonly MemberLevel = MemberRank;
  protected readonly ProgressMode = ProgressMode;
  protected readonly CEO = CEO;
  protected readonly ProgressType = ProgressType;
  protected readonly AVATAR_MEDIA = AVATAR_MEDIA;
  protected readonly Object = Object;
}
