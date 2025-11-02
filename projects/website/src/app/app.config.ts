import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import {provideRouter, withComponentInputBinding, withInMemoryScrolling} from '@angular/router';
import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {provideServiceWorker} from '@angular/service-worker';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {connectAuthEmulator, getAuth, provideAuth} from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import {connectFirestoreEmulator, getFirestore, provideFirestore} from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import {connectFunctionsEmulator, getFunctions, provideFunctions} from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import {connectStorageEmulator, getStorage, provideStorage} from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';
import {environment} from '../environments/environment';
import {SlugifyPipe, StorageUrlPipe} from '@shared/pipes';
import {AppInitService} from '@shared/services';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideNativeDateAdapter} from '@angular/material/core';
import {provideHttpClient} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({
      scrollPositionRestoration: 'top',    // force scroll to top on all navigation
      anchorScrolling: 'enabled',          // optional: support #fragment links
    })),
    provideClientHydration(withEventReplay()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ScreenTrackingService, UserTrackingService,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    AppInitService, // ✅ Provide the initialization service (i.e. is it browser or SSR)
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://localhost:9099', {disableWarnings: true});
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (environment.useEmulators) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (environment.useEmulators) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
    provideVertexAI(() => getVertexAI()),
    provideDatabase(() => getDatabase()),
    provideAnalytics(() => getAnalytics()),
    provideMessaging(() => getMessaging()),
    provideRemoteConfig(() => getRemoteConfig()),
    providePerformance(() => getPerformance()),

    SlugifyPipe,
    StorageUrlPipe,

    provideNativeDateAdapter()

    // provideHttpClient(withFetch()), // ✅ Enables fetch API for SSR
    // importProvidersFrom(BrowserModule),
    // MatIconRegistry, // Provide it normally
    // {
    //   provide: MatIconRegistry,
    //   deps: [HttpClient, DomSanitizer, DOCUMENT, ErrorHandler],
    //   useFactory: (
    //     httpClient: HttpClient,
    //     sanitizer: DomSanitizer,
    //     document: Document,
    //     errorHandler: ErrorHandler
    //   ) => {
    //     const registry = new MatIconRegistry(httpClient, sanitizer, document, errorHandler);
    //     registry.setDefaultFontSetClass('material-symbols-outlined'); // Set Material Symbols as default
    //     return registry;
    //   },
    // },
  ]
};
