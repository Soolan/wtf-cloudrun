import {Component, Signal, signal, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {AuthService, DialogConfigService} from '@shared/services';
import {AI_HEROES} from '@shared/constants';
import {BlackRendererDirective} from '@shared/directives';
import {MatButton} from '@angular/material/button';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {CarouselComponent} from './carousel/carousel.component';
import {PlansPricingComponent} from '@shared/components/plans-pricing/plans-pricing.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [
    BlackRendererDirective,
    MatButton,
    ReactiveFormsModule,
    MatIcon,
    MatButton,
    CarouselComponent,
    PlansPricingComponent
  ],
})
export class LandingComponent {
  private dialog = inject(MatDialog);
  private dialogConfig = inject(DialogConfigService);
  protected auth = inject(AuthService);
  private router = inject(Router);

  userId: Signal<string | undefined> = signal(undefined);
  private imageCache = new Map<string, string>();

  animations = signal({
    stream: false,
    fade: false,
    banner: false,
  });

  cta(url: string): void {
    console.log(url);
    if (url.includes('news')) {
      window.open(url, '_blank');
    } else if (url.includes('youtube')) {
      // Handle YouTube case
    } else {
      this.auth.login();
    }
  }

  getImage(imageName: string): string {
    if (!this.imageCache.has(imageName)) {
      const imageUrl = `url(images/${imageName}.png)`;
      this.imageCache.set(imageName, imageUrl);
    }
    return this.imageCache.get(imageName)!;
  }

  play(context: string): void {
  }

  protected readonly AI_HEROES = AI_HEROES;
}
