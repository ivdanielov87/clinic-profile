import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService, AboutContent } from '../../core/services/content.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  private contentService = inject(ContentService);

  about = signal<AboutContent | null>(null);

  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => this.about.set(c.about));
  }
}
