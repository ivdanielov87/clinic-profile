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
  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  contact = signal<ContactContent | null>(null);
  phoneCopied = signal(false);

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => this.contact.set(c.contact));
  }

  async copyPhone(): Promise<void> {
    const phone = this.contact()?.phone;
    if (!phone) return;

    try {
      await navigator.clipboard.writeText(phone);
      this.phoneCopied.set(true);

      if (this.copyTimer) clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.phoneCopied.set(false), 2000);
    } catch {
      // silent fail — clipboard unavailable
    }
  }
}
