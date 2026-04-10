import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService, PriceGroup } from '../../core/services/content.service';

const GROUP_ICONS = [
  `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="10" cy="10" r="2.5" fill="currentColor"/>
    <path d="M10 6v1.5M10 12.5V14M6 10H7.5M12.5 10H14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`,
  `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/>
    <path d="M7 10h6M10 7v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`,
  `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3l1.5 4.5H16l-3.5 2.5 1.5 4.5L10 12l-4 2.5 1.5-4.5L4 7.5h4.5L10 3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`,
];

export interface PriceGroupWithIcon extends PriceGroup {
  icon: string;
}

@Component({
  selector: 'app-prices',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './prices.html',
  styleUrl: './prices.scss',
})
export class Prices implements OnInit {
  private contentService = inject(ContentService);

  priceGroups = signal<PriceGroupWithIcon[]>([]);
  showBgn = this.contentService.showBgn();

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => {
      this.priceGroups.set(
        c.prices.map((g, i) => ({ ...g, icon: GROUP_ICONS[i] ?? GROUP_ICONS[0] }))
      );
    });
  }
}
