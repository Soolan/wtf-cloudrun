import { Component } from '@angular/core';
import {BlackRendererDirective} from '@shared/directives';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-investors',
  imports: [
    BlackRendererDirective,
    MatIcon,
    MatButton,
    RouterLink,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatDivider,
  ],
  templateUrl: './investors.component.html',
  standalone: true,
  styleUrl: './investors.component.scss'
})
export class InvestorsComponent {
  FAQ: {header: string, body: string}[] = [
    {
      header: 'How the fund will be used?',
      body: '40% Sales & Marketing. 30% Product & Engineering. 20% Legals, Admin & Operations. 10% Contingency Buffer.'
    },
    {
      header: 'What are the terms?',
      body: 'We are offering standard YC SAFE Structure with Post-Money valuation cap: $10M and $1M = 10% Ownership at Conversion'
    },
    {
      header: 'What is the investor\'s upside?',
      body: 'With NVIDIA on our side and $1M grants secured (in GPU and Cloud Credits), your capital will be focused on development, growth and scale.'
    },
    {
      header: 'How do you return?',
      body: 'The goal for the next 12 month is $50k MRR.\n' +
        'This unlocks Series A with $20M valuation.\n' +
        'Your $1M seed investment converts into a stake worth $2M (2x ROI).'
    },
  ];
  download() {

  }
}
