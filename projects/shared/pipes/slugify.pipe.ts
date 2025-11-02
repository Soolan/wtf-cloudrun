import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'slugify',
  standalone: true
})
export class SlugifyPipe implements PipeTransform {
  transform(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }
}
