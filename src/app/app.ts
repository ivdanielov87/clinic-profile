import { Component } from '@angular/core';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { Hero } from './sections/hero/hero';
import { Services } from './sections/services/services';
import { Environment } from './sections/environment/environment';
import { About } from './sections/about/about';
import { Prices } from './sections/prices/prices';
import { Testimonials } from './sections/testimonials/testimonials';
import { BookingCta } from './sections/booking-cta/booking-cta';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Navbar,
    Footer,
    Hero,
    Services,
    Environment,
    About,
    Prices,
    Testimonials,
    BookingCta,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
