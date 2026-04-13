import { Component, ElementRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private contentService = inject(ContentService);
  private hostRef = inject(ElementRef<HTMLElement>);

  scrolled = signal(false);
  menuOpen = signal(false);
  phoneOpen = signal(false);
  phoneCopied = signal(false);
  superDocUrl = signal('https://superdoc.bg/lekar/magdalena-mladenova');
  phone = signal('');
  phoneHref = signal('');

  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  readonly navLinks = [
    { label: 'Кабинетът', anchor: 'environment' },
    { label: 'Услуги', anchor: 'services' },
    { label: 'Лекарят', anchor: 'doctor' },
    { label: 'Цени', anchor: 'prices' },
    { label: 'Мнения', anchor: 'testimonials' },
    { label: 'Контакти', anchor: 'booking' },
  ];

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => {
      this.superDocUrl.set(c.contact.superDocUrl);
      this.phone.set(c.contact.phone);
      this.phoneHref.set('tel:' + c.contact.phone.replace(/\s+/g, ''));
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 10);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.phoneOpen()) {
      return;
    }

    const host = this.hostRef.nativeElement as HTMLElement;

    if (!host.contains(event.target as Node)) {
      this.phoneOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.phoneOpen()) {
      this.phoneOpen.set(false);
    }
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
    if (this.menuOpen()) {
      this.phoneOpen.set(false);
    }
  }

  togglePhone(): void {
    this.phoneOpen.update(v => !v);
    if (this.phoneOpen()) {
      this.menuOpen.set(false);
    }
  }

  async copyPhone(): Promise<void> {
    const phone = this.phone();

    if (!phone) {
      return;
    }

    try {
      await navigator.clipboard.writeText(phone);
      this.phoneCopied.set(true);
      if (this.copyTimer) {
        clearTimeout(this.copyTimer);
      }
      this.copyTimer = setTimeout(() => this.phoneCopied.set(false), 2000);
    } catch {}
  }

  scrollTo(anchor: string): void {
    this.menuOpen.set(false);
    this.phoneOpen.set(false);
    const el = document.getElementById(anchor);
    if (el) {
      const navbarHeight = window.innerWidth <= 768 ? 60 : 72;
      const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}
