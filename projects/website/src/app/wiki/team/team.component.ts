import { Component } from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSuffix} from '@angular/material/form-field';

@Component({
  selector: 'app-team',
  imports: [
    MatButton,
    MatIcon,
    MatSuffix,
  ],
  templateUrl: './team.component.html',
  standalone: true,
  styleUrls: ['./team.component.scss', '../wiki.scss']

})
export class TeamComponent {

}
