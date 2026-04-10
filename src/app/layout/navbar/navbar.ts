import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  scrolled = signal(false);
  menuOpen = signal(false);

  readonly navLinks = [
    { label: 'Услуги', anchor: 'services' },
    { label: 'Кабинетът', anchor: 'environment' },
    { label: 'Лекарят', anchor: 'doctor' },
    { label: 'Цени', anchor: 'prices' },
    { label: 'Мнения', anchor: 'testimonials' },
    { label: 'Контакти', anchor: 'booking' },
  ];

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
