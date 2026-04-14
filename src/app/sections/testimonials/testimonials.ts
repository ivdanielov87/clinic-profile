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

  private dragPointerId: number | null = null;
  private dragStartX = 0;
  private dragStartScroll = 0;
  private dragMoved = false;

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

  onTrackPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') {
      return;
    }

    const track = this.trackRef?.nativeElement;

    if (!track) {
      return;
    }

    this.dragPointerId = event.pointerId;
    this.dragStartX = event.clientX;
    this.dragStartScroll = track.scrollLeft;
    this.dragMoved = false;
    track.classList.add('is-dragging');
  }

  onTrackPointerMove(event: PointerEvent): void {
    if (this.dragPointerId === null || event.pointerId !== this.dragPointerId) {
      return;
    }

    const track = this.trackRef?.nativeElement;

    if (!track) {
      return;
    }

    const delta = event.clientX - this.dragStartX;

    if (!this.dragMoved && Math.abs(delta) > 4) {
      this.dragMoved = true;
      try {
        track.setPointerCapture(event.pointerId);
      } catch {}
    }

    if (this.dragMoved) {
      event.preventDefault();
      track.scrollLeft = this.dragStartScroll - delta;
    }
  }

  onTrackPointerUp(event: PointerEvent): void {
    if (this.dragPointerId === null || event.pointerId !== this.dragPointerId) {
      return;
    }

    const track = this.trackRef?.nativeElement;
    const wasDragging = this.dragMoved;

    this.dragPointerId = null;
    this.dragMoved = false;

    if (track) {
      track.classList.remove('is-dragging');
      try {
        track.releasePointerCapture(event.pointerId);
      } catch {}
    }

    if (wasDragging) {
      event.preventDefault();
    }
  }

  onTrackClickCapture(event: MouseEvent): void {
    if (this.dragMoved) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onCardTilt(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || this.dragMoved) {
      return;
    }

    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width; // 0..1
    const py = (event.clientY - rect.top) / rect.height;
    const maxTilt = 6;
    const rotY = (px - 0.5) * 2 * maxTilt;
    const rotX = (0.5 - py) * 2 * maxTilt;
    const glareX = px * 100;
    const glareY = py * 100;

    card.style.setProperty('--tilt-x', `${rotX.toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${rotY.toFixed(2)}deg`);
    card.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
    card.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);
    card.classList.add('is-tilting');
  }

  onCardTiltReset(event: PointerEvent): void {
    const card = event.currentTarget as HTMLElement;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.classList.remove('is-tilting');
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
