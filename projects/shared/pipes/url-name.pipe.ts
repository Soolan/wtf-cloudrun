import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'urlName',
  standalone: true,
})
@Injectable({ providedIn: 'root' })

export class UrlNamePipe implements PipeTransform {
  transform(url: string): string {
    if (!url?.trim()) return '';
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const pathname = parsed.pathname;
      let name = '';
      name = (pathname && pathname !== '/') ?
        pathname.split('/').filter(Boolean).pop()! : // Get the last segment of the path
        parsed.hostname.replace(/^www\./, '');       // Fallback to hostname
      name = name.split('?')[0].split('#')[0];       // Remove query string or fragments if any
      return name;
    } catch (e) {
      return url.length > 13 ? url.slice(0, 10) + '...' : url;
    }
  }
}
