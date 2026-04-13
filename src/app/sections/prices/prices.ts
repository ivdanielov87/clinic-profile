import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService, PriceGroup } from '../../core/services/content.service';

const GROUP_ICONS = ['exam', 'diagnostics', 'laser'] as const;
type PriceGroupIcon = (typeof GROUP_ICONS)[number];

export interface PriceGroupWithIcon extends PriceGroup {
  icon: PriceGroupIcon;
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
  openGroupIndexes = signal<Set<number>>(new Set());
  showBgn = this.contentService.showBgn();

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => {
      const groups = c.prices.map((g, i) => ({ ...g, icon: GROUP_ICONS[i] ?? GROUP_ICONS[0] }));

      this.priceGroups.set(groups);
      this.openGroupIndexes.set(new Set(groups.length > 0 ? [0] : []));
    });
  }

  toggleGroup(index: number): void {
    this.openGroupIndexes.update(current => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  }

  isGroupOpen(index: number): boolean {
    return this.openGroupIndexes().has(index);
  }
}
