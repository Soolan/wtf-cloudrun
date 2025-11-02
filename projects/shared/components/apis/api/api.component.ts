import {Component, OnInit} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {LoadingComponent} from '@shared/components';
import {MatButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {MatIcon} from '@angular/material/icon';
import {StorageUrlPipe} from '@shared/pipes';
import {ApiWithId} from '@shared/interfaces';
import {API_MOCKS} from '@shared/constants';
import {MatTab, MatTabGroup} from '@angular/material/tabs';

@Component({
  selector: 'app-api',
  imports: [
    AsyncPipe,
    LoadingComponent,
    MatButton,
    MatDivider,
    MatIcon,
    NgForOf,
    NgIf,
    StorageUrlPipe,
    MatTabGroup,
    MatTab
  ],
  templateUrl: './api.component.html',
  standalone: true,
  styleUrl: './api.component.scss'
})
export class ApiComponent implements OnInit {
  api!: ApiWithId;
  loading = true;

  ngOnInit() {
    this.api = API_MOCKS[0];
    this.loading = false;
  }

  install() {

  }
}
