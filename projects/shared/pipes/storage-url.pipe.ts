import {inject, Injector, Pipe, PipeTransform, runInInjectionContext} from '@angular/core';
import {EMPTY, from, Observable} from 'rxjs';
import {StorageService} from '@shared/services/storage.service';

@Pipe({
  name: 'storageUrl',
  pure: true,
  standalone: true
})

export class StorageUrlPipe implements PipeTransform {

  // constructor(private storage: StorageService) { }
  private storage = inject(StorageService);
  private readonly injector = inject(Injector); // ✅ THIS is what we pass to `runInInjectionContext`

  // transform(value: string): Observable<string> {
  //   const ref = this.storage.getRef(value);
  //   return value ? from(this.storage.getLink(ref)) : EMPTY;
  // }

  transform(value: string): Observable<string> {
    if (!value) return EMPTY;

    const ref = this.storage.getRef(value);

    return from(
      runInInjectionContext(this.injector, () => this.storage.getLink(ref))
    );
  }

}
