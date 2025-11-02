import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '@shared/services';

@Component({
  selector: 'app-the-shift',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './the-shift.component.html',
  standalone: true,
  styleUrl: './the-shift.component.scss'
})
export class TheShiftComponent {
  protected auth = inject(AuthService);
}
