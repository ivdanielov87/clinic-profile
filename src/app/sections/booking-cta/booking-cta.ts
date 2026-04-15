import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';
import { ContentService, ContactContent } from '../../core/services/content.service';
import { LiveContentService } from '../../core/services/live-content.service';
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
  private liveContent = inject(LiveContentService);
  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  contact = signal<ContactContent | null>(null);
  phoneCopied = signal(false);
  earliestSlotText = signal<string | null>(null);

  phoneChars = computed(() => {
    const phone = this.contact()?.phone ?? '';
    return phone.split('');
  });

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => this.contact.set(c.contact));
    this.liveContent.getLiveData().subscribe(data => {
      this.earliestSlotText.set(this.liveContent.formatSlot(data.earliestSlot));
    });
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
