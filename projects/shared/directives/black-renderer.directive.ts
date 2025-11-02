import { Directive, ElementRef, Input, Renderer2, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[libBlackRenderer]'
})
export class BlackRendererDirective implements OnChanges {
  @Input() content!: string;
  @Input() keyword!: string;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('content' in changes || 'keyword' in changes) {
      this.renderContent();
    }
  }

  private renderContent(): void {
    if (!this.content || !this.keyword || !this.content.includes(this.keyword)) {
      this.elementRef.nativeElement.textContent = this.content || '';
      return;
    }

    this.cleanUp();

    // Splitting content by the keyword while preserving occurrences
    const fragments = this.content.split(new RegExp(`(${this.escapeRegExp(this.keyword)})`, 'gi'));

    fragments.forEach(fragment =>
      fragment.toLowerCase() === this.keyword.toLowerCase()
        ? this.addStyledText(fragment, 'black')
        : this.addStyledText(fragment)
    );
  }

  private cleanUp(): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', '');
  }

  private addStyledText(text: string, className?: string): void {
    const span = this.renderer.createElement('span');
    if (className) this.renderer.addClass(span, className);
    this.renderer.appendChild(span, this.renderer.createText(text));
    this.renderer.appendChild(this.elementRef.nativeElement, span);
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
}
