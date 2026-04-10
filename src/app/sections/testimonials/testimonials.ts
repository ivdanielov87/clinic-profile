import { Component, ElementRef, ViewChild, ViewChildren, QueryList, inject, OnInit, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService, Testimonial } from '../../core/services/content.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials implements OnInit {
  private contentService = inject(ContentService);

  reviews = signal<Testimonial[]>([]);
  currentIndex = signal(0);
  readonly stars = [1, 2, 3, 4, 5] as const;

  @ViewChild('track') private trackRef?: ElementRef<HTMLDivElement>;
  @ViewChildren('cardEl') private cardRefs?: QueryList<ElementRef<HTMLElement>>;

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => this.reviews.set(c.testimonials));
  }

  onTrackScroll(): void {
    if (typeof window === 'undefined' || window.innerWidth > 768) {
      return;
    }

    const track = this.trackRef?.nativeElement;
    const cards = this.cardRefs?.toArray().map(ref => ref.nativeElement) ?? [];

    if (!track || cards.length === 0) {
      return;
    }

    const scrollCenter = track.scrollLeft + track.clientWidth / 2;
    let nextIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - scrollCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nextIndex = index;
      }
    });

    if (nextIndex !== this.currentIndex()) {
      this.currentIndex.set(nextIndex);
    }
  }

  goToSlide(index: number): void {
    const cards = this.cardRefs?.toArray().map(ref => ref.nativeElement) ?? [];
    const track = this.trackRef?.nativeElement;

    if (!track || cards.length === 0) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(index, cards.length - 1));
    const targetCard = cards[nextIndex];

    track.scrollTo({
      left: targetCard.offsetLeft,
      behavior: 'smooth',
    });

    this.currentIndex.set(nextIndex);
  }
}
