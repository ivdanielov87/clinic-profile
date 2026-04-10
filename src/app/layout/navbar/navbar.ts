import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
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

  scrolled = signal(false);
  menuOpen = signal(false);
  superDocUrl = signal('https://superdoc.bg/lekar/magdalena-mladenova');

  readonly navLinks = [
    { label: 'Услуги', anchor: 'services' },
    { label: 'Кабинетът', anchor: 'environment' },
    { label: 'Лекарят', anchor: 'doctor' },
    { label: 'Цени', anchor: 'prices' },
    { label: 'Мнения', anchor: 'testimonials' },
    { label: 'Контакти', anchor: 'booking' },
  ];

  ngOnInit(): void {
    this.contentService.getContent().subscribe(c => {
      this.superDocUrl.set(c.contact.superDocUrl);
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 10);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  scrollTo(anchor: string): void {
    this.menuOpen.set(false);
    const el = document.getElementById(anchor);
    if (el) {
      const navbarHeight = window.innerWidth <= 768 ? 60 : 72;
      const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}
