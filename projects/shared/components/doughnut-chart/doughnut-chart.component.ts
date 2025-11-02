import {Component, Input, computed} from '@angular/core';
import {DecimalPipe, NgIf} from '@angular/common';
import {
  DEFAULT_CHART_BACKGROUND, DEFAULT_CHART_CENTER, DEFAULT_CHART_COLOR, DEFAULT_CHART_FONT_COLOR,
  DEFAULT_CHART_FONT_SIZE, DEFAULT_CHART_RADIUS, DEFAULT_CHART_SIZE, DEFAULT_CHART_STROKE,
  DEFAULT_CHART_TITLE, DEFAULT_CHART_TOTAL, DEFAULT_CHART_UNIT, DEFAULT_CHART_USED
} from '@shared/constants/charts';

@Component({
  selector: 'lib-doughnut-chart',
  standalone: true,
  imports: [DecimalPipe, NgIf],
  templateUrl: './doughnut-chart.component.html',
  styleUrl: './doughnut-chart.component.scss',
})
export class DoughnutChartComponent {
  @Input() title = DEFAULT_CHART_TITLE;
  @Input() total = DEFAULT_CHART_TOTAL;
  @Input() used = DEFAULT_CHART_USED;
  @Input() unit: string = DEFAULT_CHART_UNIT;
  @Input() radius = DEFAULT_CHART_RADIUS;
  @Input() strokeWidth = DEFAULT_CHART_STROKE;
  @Input() foregroundColor = DEFAULT_CHART_COLOR;
  @Input() backgroundColor = DEFAULT_CHART_BACKGROUND;
  @Input() fontSize = DEFAULT_CHART_FONT_SIZE;
  @Input() fontColor = DEFAULT_CHART_FONT_COLOR;

  readonly center = DEFAULT_CHART_CENTER; // For a 36x36 viewBox
  readonly viewBoxSize = DEFAULT_CHART_SIZE;

  percentage = computed(() => {
    return this.total > 0 ? Math.min((this.used / this.total) * 100, 100) : 0;
  });

  readonly baseFontSize = computed(() => parseFloat(this.fontSize));
  readonly subFontSize = computed(() => this.baseFontSize() * 0.25 + 'em');
  readonly percentageFontSize = computed(() => this.baseFontSize() * 0.8 + 'em');

  // Distance below percentage for "Total"
  dyTotal(): string {
    return `${parseFloat(this.fontSize) * 6}em`; // e.g. 6x of main font height
  }

  // Distance below "Total" for "Used"
  dyUsed(): string {
    return `${parseFloat(this.fontSize) * 2.5}em`; // slightly smaller spacing
  }

  get strokeDasharray(): string {
    const circumference = 2 * Math.PI * this.radius;
    const percent = this.percentage();
    const usedLength = (percent / 100) * circumference;
    const remainingLength = circumference - usedLength;
    return `${usedLength} ${remainingLength}`;
  }
}
