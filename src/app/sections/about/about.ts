import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService, AboutContent } from '../../core/services/content.service';
import { LiveContentService } from '../../core/services/live-content.service';

interface ParsedHighlight {
  prefix: string;
  from: number;
  target: number;
  suffix: string;
  original: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit, AfterViewInit, OnDestroy {
  private contentService = inject(ContentService);
  private liveContent = inject(LiveContentService);

  about = signal<AboutContent | null>(null);
  displayValues = signal<string[]>([]);
  liveRating = signal<number | null>(null);
  liveRatingCount = signal<number | null>(null);

  private parsed: ParsedHighlight[] = [];
  private statsObserver: IntersectionObserver | null = null;
  private animated = false;
  private rafId: number | null = null;
  private statsEl: HTMLElement | null = null;

  @ViewChild('statsRow')
  set statsRowRef(ref: ElementRef<HTMLElement> | undefined) {
    if (ref && ref.nativeElement !== this.statsEl) {
      this.statsEl = ref.nativeElement;
      this.setupObserver();
    }
  }

  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => {
      this.about.set(c.about);
      this.parsed = c.about.highlights.map(h => this.parseValue(h.value));
      this.displayValues.set(
        this.parsed.map(p => `${p.prefix}${p.from}${p.suffix}`),
      );
      this.setupObserver();
    });
    this.liveContent.getLiveData().subscribe(data => {
      if (data.rating !== null) this.liveRating.set(data.rating);
      if (data.ratingCount !== null) this.liveRatingCount.set(data.ratingCount);
    });
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.statsObserver?.disconnect();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  }

  private parseValue(value: string): ParsedHighlight {
    const match = value.match(/^(\D*)(\d+)(.*)$/);
    if (!match) {
      return { prefix: '', from: 0, target: 0, suffix: value, original: value };
    }
    const target = parseInt(match[2], 10);
    // For year-like values (e.g. 2021), start near the target so the ticker
    // reads as a calendar roll, not a count from zero.
    const from = target >= 1900 ? target - 30 : 0;
    return {
      prefix: match[1],
      from,
      target,
      suffix: match[3],
      original: value,
    };
  }

  private setupObserver(): void {
    if (this.statsObserver || this.animated) return;
    if (!this.statsEl || this.parsed.length === 0) return;
    const el = this.statsEl;
    if (typeof IntersectionObserver === 'undefined') {
      this.showFinal();
      return;
    }

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      this.showFinal();
      return;
    }

    this.statsObserver = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting) && !this.animated) {
          this.animated = true;
          this.runCountUp();
          this.statsObserver?.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    this.statsObserver.observe(el);
  }

  private showFinal(): void {
    this.animated = true;
    this.displayValues.set(this.parsed.map(p => p.original));
  }

  private runCountUp(): void {
    const duration = 2600;
    const start = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOut(t);

      this.displayValues.set(
        this.parsed.map(p => {
          const current = Math.round(p.from + (p.target - p.from) * eased);
          return `${p.prefix}${current}${p.suffix}`;
        }),
      );

      if (t < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }
}
