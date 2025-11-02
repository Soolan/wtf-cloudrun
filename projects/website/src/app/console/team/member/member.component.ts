import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {MemberWithId} from '@shared/interfaces';
import {AsyncPipe, NgForOf, NgIf, NgStyle} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {StorageUrlPipe} from '@shared/pipes';
import {RouterLink} from '@angular/router';
import {MatTooltip} from '@angular/material/tooltip';
import {CrudService} from '@shared/services';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    NgIf,
    StorageUrlPipe,
    StorageUrlPipe,
    NgStyle,
    MatMenuTrigger,
    RouterLink,
    MatTooltip,
    NgForOf,
    MatButton
  ]
})
export class MemberComponent {
  @Input() path!: string;
  @Input() member!: MemberWithId;
  @Input() isTeam?: boolean = false;
  @Input() isBoard?: boolean = false;
  @Output() onDelete = new EventEmitter();

  private crud = inject(CrudService);

  showConfirm = false;

  visit(link: string): void {
    (this.isEmail(link))?
      window.open('mailto:'+link, '_self'):
      window.open(link, '_blank');
  }

  isEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  getClassName(link: string): string {
    return (this.isEmail(link))?
      'email': link.toLowerCase().includes('instagram')?
        'instagram': 'linkedin';
  }

  delete() {
    console.log(this.path, this.member.id);
    this.crud.delete(this.path, this.member.id);
    this.showConfirm = false;
    this.onDelete.emit();
  }

  get warningStyles() {
    return this.showConfirm ? {
      'background-color': 'var(--color-warn-lighter)',
      'padding-top': 'var(--space-xs)',
      'margin': 'var(--space-lg) 0'
    } : {};
  }

}
