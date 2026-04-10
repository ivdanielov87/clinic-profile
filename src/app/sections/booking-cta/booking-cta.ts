import { Component, inject, OnInit, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService, ContactContent } from '../../core/services/content.service';
import { ClinicMap } from '../../shared/clinic-map/clinic-map';

@Component({
  selector: 'app-booking-cta',
  standalone: true,
  imports: [AnimateOnScrollDirective, ClinicMap],
  templateUrl: './booking-cta.html',
  styleUrl: './booking-cta.scss',
})
export class BookingCta implements OnInit {
  private contentService = inject(ContentService);

  contact = signal<ContactContent | null>(null);

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => this.contact.set(c.contact));
  }
}
