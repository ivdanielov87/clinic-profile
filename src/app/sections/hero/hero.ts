import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService } from '../../core/services/content.service';
import { LiveContentService } from '../../core/services/live-content.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements OnInit {
  private contentService = inject(ContentService);
  private liveContent = inject(LiveContentService);

  superDocUrl = signal('https://superdoc.bg/lekar/magdalena-mladenova');
  liveRating = signal<number | null>(null);
  liveRatingCount = signal<number | null>(null);
  ratingDisplay = computed(() => (this.liveRating() ?? 4.9).toFixed(1));

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => {
      this.superDocUrl.set(c.contact.superDocUrl);
    });
    this.liveContent.getLiveData().subscribe(data => {
      if (data.rating !== null) this.liveRating.set(data.rating);
      if (data.ratingCount !== null) this.liveRatingCount.set(data.ratingCount);
    });
  }

  scrollTo(anchor: string): void {
    const el = document.getElementById(anchor);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}
