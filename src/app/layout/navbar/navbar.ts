import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ContentService } from '../../core/services/content.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit, AfterViewInit, OnDestroy {
  private contentService = inject(ContentService);
  private hostRef = inject(ElementRef<HTMLElement>);

  scrolled = signal(false);
  scrollProgress = signal(0);
  activeSection = signal<string | null>(null);
  menuOpen = signal(false);
  phoneOpen = signal(false);
  phoneCopied = signal(false);
  superDocUrl = signal('https://superdoc.bg/lekar/magdalena-mladenova');
  phone = signal('');
  phoneHref = signal('');
  phoneChars = computed(() => this.phone().split(''));

  private copyTimer: ReturnType<typeof setTimeout> | null = null;
  private sectionObserver: IntersectionObserver | null = null;

  readonly navLinks = [
    { label: 'Кабинетът', anchor: 'environment' },
    { label: 'Услуги', anchor: 'services' },
    { label: 'Лекарят', anchor: 'doctor' },
    { label: 'Цени', anchor: 'prices' },
    { label: 'Мнения', anchor: 'testimonials', mobileOnly: true },
    { label: 'Контакти', anchor: 'booking' },
  ];

  readonly desktopNavLinks = this.navLinks.filter(l => !l.mobileOnly);

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => {
      this.superDocUrl.set(c.contact.superDocUrl);
      this.phone.set(c.contact.phone);
      this.phoneHref.set('tel:' + c.contact.phone.replace(/\s+/g, ''));
    });
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const sections = this.navLinks
      .map(link => document.getElementById(link.anchor))
      .filter((el): el is HTMLElement => !!el);

    this.sectionObserver = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          this.activeSection.set(visible.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach(s => this.sectionObserver!.observe(s));
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
    if (this.copyTimer) {
      clearTimeout(this.copyTimer);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const y = window.scrollY;
    this.scrolled.set(y > 10);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    this.scrollProgress.set(progress);
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
