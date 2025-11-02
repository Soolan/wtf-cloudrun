import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { SeoSocialShare } from '@shared/interfaces/seo-social-share';
import { SeoSocialShareService } from '@shared/services';
import { SEO_CONFIG } from '@shared/constants/seos';
import { SeoType } from '@shared/enums';

@Injectable({
  providedIn: 'root',
})
export class SeoResolverService implements Resolve<SeoSocialShare> {
  constructor(private seoService: SeoSocialShareService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): SeoSocialShare {
    const seoType: SeoType = route.data['seoType'] || SeoType.DEFAULT;
    const seo = SEO_CONFIG[seoType];
    this.seoService.setData(seo);
    return seo;
  }
}
