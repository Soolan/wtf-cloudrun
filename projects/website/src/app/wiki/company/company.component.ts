import { Component } from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSuffix} from '@angular/material/form-field';

@Component({
  selector: 'app-company',
  imports: [
    MatButton,
    MatIcon,
    MatSuffix
  ],
  templateUrl: './company.component.html',
  standalone: true,
  styleUrls: ['./company.component.scss', '../wiki.scss']
})
export class CompanyComponent {

}
