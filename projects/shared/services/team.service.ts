import { Injectable, inject, signal } from '@angular/core';
import { CrudService } from './crud.service';
import {Entity, Member, MemberWithId} from '@shared/interfaces';
import {BLANK_MEMBER, MEMBERS} from '@shared/constants';
import {MemberRank} from '@shared/enums';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private crud = inject(CrudService);

  boardMembers = signal<MemberWithId[]>([]);
  cSuiteMembers = signal<MemberWithId[]>([]);
  departmentMembers = signal<{ [key: string]: MemberWithId[] }>({});
  employees = signal<MemberWithId[]>([]);
  everyOne = signal<MemberWithId[]>([]);
  path = signal<string | null>(null);

  async setDefaultMember(path: string, member: Entity): Promise<any> {
    const data: Member = { ...BLANK_MEMBER, persona: member, rank: MemberRank.Board, role: 'Board member' };
    console.log(data);
    return await this.crud.add(path, data);
  }

  async initMembers(path: string): Promise<void> {
    this.reset();
    const q = { ...MEMBERS, path };
    const members = (await this.crud.getDocs(q, true, true)) as MemberWithId[];
    if (!members?.length) return;

    const board: MemberWithId[] = [];
    const cSuite: MemberWithId[] = [];
    const employees: MemberWithId[] = [];
    const departmentMembers: { [key: string]: MemberWithId[] } = {};

    members.forEach((member) => {
      switch (member.rank) {
        case MemberRank.Board:
          board.push(member);
          break;
        case MemberRank.CSuite:
          cSuite.push(member);
          break;
        case MemberRank.Department:
          employees.push(member);
          if (!departmentMembers[member.department]) {
            departmentMembers[member.department] = [];
          }
          departmentMembers[member.department].push(member);
          break;
      }
    });

    // Sort by `order` property
    board.sort((a, b) => a.order - b.order);
    cSuite.sort((a, b) => a.order - b.order);
    Object.values(departmentMembers).forEach((dept) => {
      dept.sort((a, b) => a.order - b.order)
    });

    // Update signals
    this.boardMembers.set(board);
    this.cSuiteMembers.set(cSuite);
    this.departmentMembers.set(departmentMembers);
    this.employees.set(employees);
    this.everyOne.set(members);
  }

  getDepByMemberId(id: string): string {
    const member =
      this.everyOne().find(member => member.persona.role === id);
    return member?.department || 'Board';
  }

  getMemberByProfileId(id: string): MemberWithId | undefined {
    return this.everyOne().find(member => member.persona.role === id);
  }

  reset(): void {
    this.boardMembers.set([]);
    this.cSuiteMembers.set([]);
    this.departmentMembers.set({});
    this.employees.set([]);
  }
}
