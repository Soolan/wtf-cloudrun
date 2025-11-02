import {Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output, PLATFORM_ID, signal} from '@angular/core';
import {Hero} from '@shared/interfaces';
import {interval, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {isPlatformServer, NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {BlackRendererDirective} from '@shared/directives';
import {MatButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-carousel',
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    BlackRendererDirective,
    MatButton,
    MatIcon,
    MatMiniFabButton,
    NgStyle,
    MatProgressSpinner
  ],
  templateUrl: './carousel.component.html',
  standalone: true,
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit {
  @Input() banners: Hero[] = [];
  @Output() ctaClicked = new EventEmitter<string>();

  private destroyRef = inject(DestroyRef);
  currentIndex = signal(0);
  progressValue = signal(0);

  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (!isPlatformServer(this.platformId) && this.banners.length) {
      this.startCarousel();
    }
  }

  private startCarousel() {
    interval(190)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((value) => {
          const progress = value % 100;
          this.progressValue.set(progress);
          if (progress === 99) this.nextBanner();
        })
      )
      .subscribe();
  }

  nextBanner() {
    if (this.banners.length) {
      this.currentIndex.set((this.currentIndex() + 1) % this.banners.length);
      this.progressValue.set(0);
    }
  }

  prevBanner() {
    if (this.banners.length) {
      this.currentIndex.set((this.currentIndex() - 1 + this.banners.length) % this.banners.length);
      this.progressValue.set(0);
    }
  }

  goToBanner(index: number) {
    if (index >= 0 && index < this.banners.length) {
      this.currentIndex.set(index);
      this.progressValue.set(0);
    }
  }

  open(url: string) {
    console.log(url);
    this.ctaClicked.emit(url);
  }
}
