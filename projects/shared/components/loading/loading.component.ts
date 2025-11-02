import {Component, Input} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ProgressMode, ProgressType} from '@shared/enums';

@Component({
  selector: 'lib-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  standalone: true,
  imports: [
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],

})
export class LoadingComponent{
  @Input() type: ProgressType = ProgressType.Spinner;
  @Input() mode: ProgressMode = ProgressMode.Indeterminate;
  @Input() progress: number = 100;
  @Input() color: string = 'primary';
  @Input() message: string = 'Please Wait...';

  protected readonly ProgressType = ProgressType;
}
