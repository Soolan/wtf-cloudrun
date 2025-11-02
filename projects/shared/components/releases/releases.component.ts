import {Component, inject, OnInit, signal, PLATFORM_ID, Inject} from '@angular/core';
import {Quarter, Release, ReleaseWithId} from '@shared/interfaces';
import {CrudService} from '@shared/services';
import {PRODUCTS, PRODUCTS_ICONS, RELEASES} from '@shared/constants';
import {Timestamp} from '@angular/fire/firestore';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {DatePipe, SlicePipe, isPlatformBrowser} from '@angular/common';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatIcon} from '@angular/material/icon';
import {LoadingComponent} from '@shared/components';
import {ReleaseNotesComponent} from './release-notes/release-notes.component';

@Component({
  selector: 'lib-releases',
  imports: [
    DatePipe,
    LoadingComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIcon,
    MatPaginator,
    ReleaseNotesComponent,
    SlicePipe
  ],
  templateUrl: './releases.component.html',
  standalone: true,
  styleUrl: './releases.component.scss'
})
export class ReleasesComponent implements OnInit {
  protected crud = inject(CrudService);
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  loading = signal<boolean>(true);

  releases: Release[] = [];
  roadmaps: Release[] = [];
  quarters: Quarter[] = [];
  products = PRODUCTS;
  productIcons = PRODUCTS_ICONS;

  // Pagination variables
  pageSize = 10; // Number of items to display per page
  start = 0;
  end = this.pageSize;
  totalItems!: number; // Total number of items in the collection


  async ngOnInit() {
    if (this.isBrowser) {
      const releases = await this.crud.getDocs(RELEASES, true, true) as ReleaseWithId[];
      this.loading.set(false);
      if (!releases) return;
      releases.forEach((release: Release) => {
        if (release.date) { // Ensure release.date is not null or undefined
          (this.safeToDate(release.date).getTime() > Date.now()) ?
            this.roadmaps.push(release) :
          this.releases.push(release);
        }
      });
      this.totalItems = this.releases.length;
      this.setQuarters();
    } else {
      // For SSR, initialize with empty data to prevent errors
      this.loading.set(false);
      this.releases = [];
      this.roadmaps = [];
      this.totalItems = 0;
      this.setQuarters();
    }
  }

  public getPaginatorData(event: PageEvent): PageEvent {
    this.start = event.pageIndex * event.pageSize;
    this.end = this.start + event.pageSize;
    return event;
  }

  setQuarters(): void {
    let quarter: string;
    this.roadmaps.sort((a: any, b: any) => this.safeToDate(a.date).getTime() - this.safeToDate(b.date).getTime());
    this.roadmaps.forEach(r => {
      quarter = this.getQuarter(r.date as Timestamp);
      if (this.quarters.length === 0) {
        this.quarters.push({quarter: quarter, items: this.aggregate(r)});
      } else {
        const entry = this.quarters.find(item => item.quarter === quarter);
        if (entry) {
          entry.items = this.aggregate(r, entry.items)
        } else {
          this.quarters.push({quarter: quarter, items: this.aggregate(r)})
        }
      }
    });
    // this.quarters.sort((a: any, b: any) => a.date.seconds - b.date.seconds);
  }


  getQuarter(date: Timestamp): string {
    const quarter = Math.floor(this.safeToDate(date).getMonth() / 3 + 1);
    const year = new Date(this.safeToDate(date)).getFullYear();
    return `Q${quarter}, ${year}`;
  }

  aggregate(release: Release, qItems?: string[]): string[] {
    let items = release.features
      .concat(release.improvements)
      .concat(release.fixes)
      .concat(release.operations);
    if (qItems) items = qItems.concat(items); // Always put the new qItems at the beginning of array
    return items;
  }

  private safeToDate(timestamp: Timestamp): Date {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    // Fallback for SSR or invalid timestamp objects
    return new Date(0); // Return a default valid Date object
  }

}
