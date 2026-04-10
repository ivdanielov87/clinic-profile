import { Component, inject, OnInit, signal } from '@angular/core';
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

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => this.reviews.set(c.testimonials));
  }
}
