import {Component, DOCUMENT, HostListener, Inject, inject, Input} from '@angular/core';
import {NgForOf, NgIf, TitleCasePipe, UpperCasePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatAnchor, MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {CompanyService} from '@shared/services';

@Component({
  selector: 'lib-breadcrumbs',
  imports: [
    NgForOf,
    RouterLink,
    NgIf,
    MatIcon,
    MatIconButton,
    MatButton,
    TitleCasePipe
  ],
  templateUrl: './breadcrumbs.component.html',
  standalone: true,
  styleUrl: './breadcrumbs.component.scss'
})
export class BreadcrumbsComponent {
  @Input() breadcrumbs: { label: string; url: string }[] = [];
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const element = this.document.getElementById('breadcrumbs') as HTMLElement;
    const shouldInvert = window.scrollY > element.clientHeight * 0.1;
    element.classList.toggle('inverse-nav', shouldInvert);
  }

  protected companyService = inject(CompanyService);
}
