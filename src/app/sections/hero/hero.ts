import { Component, OnInit, inject, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements OnInit {
  private contentService = inject(ContentService);

  readonly stats = [
    { value: '15+', label: 'ГОДИНИ ОПИТ' },
    { value: '4.9', label: 'РЕЙТИНГ' },
    { value: '811', label: 'ОЦЕНКИ' },
  ];
  superDocUrl = signal('https://superdoc.bg/lekar/magdalena-mladenova');

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => {
      this.superDocUrl.set(c.contact.superDocUrl);
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
