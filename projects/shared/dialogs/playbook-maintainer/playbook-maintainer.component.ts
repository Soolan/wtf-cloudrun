import {Component, computed, inject, OnInit, Signal, signal} from '@angular/core';
import {CompanyService, PlaybookService, TeamService} from '@shared/services';
import {MemberWithId} from '@shared/interfaces';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {AsyncPipe} from '@angular/common';
import {MatInput} from '@angular/material/input';
import {CEO, MEMBERS} from '@shared/constants';
import {StorageUrlPipe} from '@shared/pipes';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'lib-playbook-maintainer',
  imports: [
    MatFormFieldModule,
    MatDialogModule,
    MatButtonModule,
    MatIcon,
    MatInput,
    AsyncPipe,
    StorageUrlPipe,
    MatDivider
  ],
  templateUrl: './playbook-maintainer.component.html',
  standalone: true,
  styleUrl: './playbook-maintainer.component.scss'
})
export class PlaybookMaintainerComponent implements OnInit{
  private teamService = inject(TeamService);
  private companyService = inject(CompanyService);
  private playbookService = inject(PlaybookService);
  private dialogRef = inject(MatDialogRef<PlaybookMaintainerComponent>);

  search = signal<string>('');
  selectedMember = signal<MemberWithId | null>(null);

  members: Signal<MemberWithId[]> = computed(() => {
    const term = this.search().toLowerCase();
    return this.teamService.everyOne().filter(m =>
      m.persona.name.toLowerCase().includes(term) ||
      m.role.toLowerCase().includes(term)
    );
  });

  async ngOnInit() {
    const path = `${this.companyService.path()}/${this.companyService.id()}/${MEMBERS.path}`
    await this.teamService.initMembers(path);
    const maintainer = this.members()
      .find(member => member.persona.name === this.playbookService.stats()?.maintainer.name);
    this.selectedMember.set(maintainer || null);

    console.log(this.members(), maintainer);
  }

  pickMember(member: MemberWithId): void {
    this.selectedMember.set(member);
  }

  select(): void {
    if (this.selectedMember()) {
      this.dialogRef.close(this.selectedMember());
    }
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.search.set(input.value);
  }

  protected readonly HTMLInputElement = HTMLInputElement;
  protected readonly CEO = CEO;
}
