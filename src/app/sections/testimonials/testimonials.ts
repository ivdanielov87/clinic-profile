import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService, Testimonial } from '../../core/services/content.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials implements OnInit, AfterViewInit {
  private contentService = inject(ContentService);

  reviews = signal<Testimonial[]>([]);
  currentSlide = signal(0);
  cardsPerView = signal(3);
  totalSlides = computed(() => Math.ceil(this.reviews().length / this.cardsPerView()));
  slideIndexes = computed(() => Array.from({ length: this.totalSlides() }, (_, index) => index));
  readonly stars = [1, 2, 3, 4, 5] as const;

  @ViewChild('track') private trackRef?: ElementRef<HTMLDivElement>;
  @ViewChildren('cardEl') private cardRefs?: QueryList<ElementRef<HTMLElement>>;

  ngOnInit(): void {
    this.cardsPerView.set(this.resolveCardsPerView());
    this.contentService.getContent().subscribe(c => {
      this.reviews.set(c.testimonials);
      setTimeout(() => this.goToSlide(0, 'auto'));
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.syncCarouselToViewport('auto'));
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncCarouselToViewport('auto');
  }

  onTrackScroll(): void {
    const track = this.trackRef?.nativeElement;
    const cards = this.cardRefs?.toArray().map(ref => ref.nativeElement) ?? [];
    const slideStarts = this.getSlideStartCards(cards);

    if (!track || slideStarts.length === 0) {
      return;
    }

    const scrollLeft = track.scrollLeft;
    let nextSlide = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slideStarts.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - scrollLeft);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nextSlide = index;
      }
    });

    if (nextSlide !== this.currentSlide()) {
      this.currentSlide.set(nextSlide);
    }
  }

  goToSlide(index: number, behavior: ScrollBehavior = 'smooth'): void {
    const cards = this.cardRefs?.toArray().map(ref => ref.nativeElement) ?? [];
    const track = this.trackRef?.nativeElement;
    const slideStarts = this.getSlideStartCards(cards);

    if (!track || slideStarts.length === 0) {
      return;
    }

    const nextSlide = Math.max(0, Math.min(index, slideStarts.length - 1));
    const targetCard = slideStarts[nextSlide];

    track.scrollTo({
      left: targetCard.offsetLeft,
      behavior,
    });

    this.currentSlide.set(nextSlide);
  }

  prevSlide(): void {
    this.goToSlide(this.currentSlide() - 1);
  }

  nextSlide(): void {
    this.goToSlide(this.currentSlide() + 1);
  }

  private syncCarouselToViewport(behavior: ScrollBehavior): void {
    const previousCardsPerView = this.cardsPerView();
    const nextCardsPerView = this.resolveCardsPerView();
    const leadingReviewIndex = this.currentSlide() * previousCardsPerView;

    this.cardsPerView.set(nextCardsPerView);

    const nextSlide =
      this.totalSlides() === 0
        ? 0
        : Math.min(Math.floor(leadingReviewIndex / nextCardsPerView), this.totalSlides() - 1);

    this.currentSlide.set(nextSlide);
    this.goToSlide(nextSlide, behavior);
  }

  private getSlideStartCards(cards: HTMLElement[]): HTMLElement[] {
    const step = Math.max(1, this.cardsPerView());
    return cards.filter((_, index) => index % step === 0);
  }

  private resolveCardsPerView(): number {
    if (typeof window === 'undefined') {
      return 3;
    }

    if (window.innerWidth <= 768) {
      return 1;
    }

    if (window.innerWidth <= 1200) {
      return 2;
    }

    return 3;
  }
}
