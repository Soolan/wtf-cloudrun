import { Injectable, Inject, Renderer2, RendererFactory2, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import {JsonLdData, SeoSocialShare} from '@shared/interfaces/seo-social-share';

@Injectable({
  providedIn: 'root',
})
export class SeoSocialShareService {
  private renderer: Renderer2;

  constructor(
    private readonly metaService: Meta,
    private readonly titleService: Title,
    @Inject(DOCUMENT) private readonly document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public setData(data: SeoSocialShare): void {
    this.setTitle(data.title);
    this.setDescription(data.description);
    this.setKeywords(data.keywords);
    this.setUrl(data.url);
    this.setType(data.type);
    this.setImage(data.image, data.imageAuxData);
    this.setAuthor(data.author);
    this.setPublished(data.published);
    this.setModified(data.modified);
    this.setJsonLd(data.jsonLd);
  }

  private setJsonLd(jsonLdData?: JsonLdData): void {
    if (!jsonLdData) return;

    let scriptElement = this.document.querySelector(`script[type="application/ld+json"]`);
    if (scriptElement) {
      scriptElement.remove();
    }

    scriptElement = this.renderer.createElement('script');
    if (scriptElement) {
      this.renderer.setAttribute(scriptElement, 'type', 'application/ld+json');
      scriptElement.textContent = JSON.stringify(jsonLdData);
      this.renderer.appendChild(this.document.head, scriptElement);
    }
  }

  private setTitle(title?: string): void {
    if (title) {
      this.titleService.setTitle(title);
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ name: 'twitter:title', content: title });
    }
  }

  private setDescription(description?: string): void {
    if (description) {
      this.metaService.updateTag({ name: 'description', content: description });
      this.metaService.updateTag({ property: 'og:description', content: description });
    }
  }

  private setKeywords(keywords?: string): void {
    this.metaService.updateTag({ name: 'keywords', content: keywords ?? '' });
  }

  private setUrl(url?: string): void {
    if (url) {
      this.metaService.updateTag({ property: 'og:url', content: url });
    }
  }

  private setType(type?: string): void {
    this.metaService.updateTag({ property: 'og:type', content: type ?? 'website' });
  }

  private setImage(image?: string, auxData?: any): void {
    if (image) {
      this.metaService.updateTag({ property: 'og:image', content: image });
      this.metaService.updateTag({ name: 'twitter:image', content: image });
    }
  }

  private setAuthor(author?: string): void {
    this.metaService.updateTag({ name: 'author', content: author ?? '' });
  }

  private setPublished(published?: string): void {
    if (published) {
      this.metaService.updateTag({ name: 'article:published_time', content: published });
    }
  }

  private setModified(modified?: string): void {
    if (modified) {
      this.metaService.updateTag({ name: 'article:modified_time', content: modified });
    }
  }
}
