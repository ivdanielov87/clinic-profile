import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  readonly stats = [
    { value: '15+', label: 'ГОДИНИ ОПИТ' },
    { value: '4.9', label: 'РЕЙТИНГ' },
    { value: '811', label: 'ОЦЕНКИ' },
  ];

  scrollTo(anchor: string): void {
    const el = document.getElementById(anchor);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}
