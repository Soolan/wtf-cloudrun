import { Injectable, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialogConfig } from '@angular/material/dialog';
import { map } from 'rxjs';
import {DIALOG_DELAY_100} from '@shared/constants';

@Injectable({
  providedIn: 'root'
})
export class DialogConfigService {
  private readonly widthMap = new Map<string, string>([
    ['(min-width: 1280px)', '60vw'],
    [Breakpoints.Medium, '70vw'],
    [Breakpoints.Small, '80vw'],
    [Breakpoints.XSmall, '100vw'], // Ensure full width on small screens
    // [Breakpoints.XSmall, '100%'],
  ]);

  width = signal<string>('60vw'); // Use a signal for reactive updates

  constructor(private breakpoint: BreakpointObserver) {
    this.breakpoint
      .observe([...this.widthMap.keys()])
      .pipe(
        map(state => {
          // Prioritize smallest screen match (XSmall first)
          const matchedBreakpoint = [...this.widthMap.keys()]
            .reverse() // Start from smallest breakpoints
            .find(bp => state.breakpoints[bp]);

          return this.widthMap.get(matchedBreakpoint || '(min-width: 1280px)')!;
        })
      )
      .subscribe(width => this.width.set(width));
  }

  getConfig(): MatDialogConfig {
    const isFullScreen = this.width() === '100vw';

    return {
      minWidth: this.width(),
      height: isFullScreen ? '100vh' : 'auto', // Full height on small screens
      panelClass: 'dialog',
      enterAnimationDuration: DIALOG_DELAY_100,
      exitAnimationDuration: DIALOG_DELAY_100,
      ...(isFullScreen && { minWidth: '100vw', minHeight: '100vh' }), // Ensure full screen effect
    };
  }
}

