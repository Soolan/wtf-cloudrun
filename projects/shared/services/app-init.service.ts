import { Injectable, ApplicationRef, inject } from '@angular/core';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from '@angular/fire/app-check';
import { getApp } from '@angular/fire/app';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  private appRef = inject(ApplicationRef);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.appRef.isStable.subscribe((stable) => {
      if (stable && isPlatformBrowser(this.platformId)) {
        // Ensure AppCheck runs only in the browser
        const app = getApp();
        const provider = new ReCaptchaEnterpriseProvider('6LfYvNcqAAAAAFrjWelnzpTnDpliDsZd_8FkZCXI');
        initializeAppCheck(app, { provider, isTokenAutoRefreshEnabled: true });
      }
    });
  }
}
