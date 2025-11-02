import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {AuthService} from '@shared/services';
import {MatCardModule} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {WikiCard} from '@shared/interfaces/wiki';
import {WIKI_CARDS} from '@shared/constants/wikis';
import {MatDivider} from '@angular/material/divider';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-overview',
  imports: [
    MatButton,
    MatCardModule,
    MatIcon,
    MatDivider,
    RouterLink
  ],
  templateUrl: './overview.component.html',
  standalone: true,
  styleUrl: './overview.component.scss'
})
export class OverviewComponent {
  protected auth = inject(AuthService);
  protected readonly WIKI_CARDS = WIKI_CARDS;
}
