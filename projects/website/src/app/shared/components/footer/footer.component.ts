import { Component, Input, inject } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import {MatAnchor, MatButton} from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {Product} from '@shared/enums';
import {SOCIALS} from '@shared/constants';
import {EmailSubscriberComponent} from '@shared/components';
import {AuthService, LayoutVisibilityService} from '@shared/services';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: true,
  imports: [
    MatDivider,
    EmailSubscriberComponent,
    MatAnchor,
    MatDivider,
    RouterLink,
    EmailSubscriberComponent,
    MatButton,
    AsyncPipe,
  ],
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() product!: Product;

  protected layoutService = inject(LayoutVisibilityService);
  protected authService = inject(AuthService);

  year = new Date().getFullYear();

  navigate(label: string): void {
    const social = SOCIALS.find(s => s.label.toLowerCase() === label);
    if (social?.url) {
      window.open(social.url, '_blank');
    } else {
      console.warn(`Social link for "${label}" not found.`);
    }
  }

  protected readonly SOCIALS = SOCIALS;
}
