import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-clinic-map',
  standalone: true,
  template: `
    <div class="clinic-map">
      <iframe
        class="clinic-map__frame"
        [title]="label"
        [src]="embedUrl"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>

      <!-- <div class="clinic-map__panel">
        <div class="clinic-map__pin" aria-hidden="true"></div>

        <div class="clinic-map__meta">
          <span class="clinic-map__eyebrow">Clinic location</span>
          <strong class="clinic-map__label">{{ label }}</strong>
          <span class="clinic-map__coords">{{ lat.toFixed(5) }}, {{ lng.toFixed(5) }}</span>
        </div>

        <a
          class="clinic-map__link"
          [href]="directionsUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Maps
        </a>
      </div> -->
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .clinic-map {
      position: relative;
      height: 100%;
      min-height: inherit;
      overflow: hidden;
      background:
        radial-gradient(circle at 18% 18%, rgba(91, 159, 224, 0.2), transparent 32%),
        linear-gradient(180deg, rgba(20, 33, 56, 0.96), rgba(12, 22, 39, 0.92));
    }

    .clinic-map__frame {
      display: block;
      width: 100%;
      height: 100%;
      min-height: inherit;
      border: 0;
      filter: saturate(0.9) contrast(1.02);
    }

    // .clinic-map__panel {
    //   position: absolute;
    //   left: 1rem;
    //   right: 1rem;
    //   bottom: 1rem;
    //   display: flex;
    //   align-items: center;
    //   gap: 0.9rem;
    //   padding: 0.95rem 1rem;
    //   border: 1px solid rgba(255, 255, 255, 0.14);
    //   border-radius: 18px;
    //   background: rgba(12, 22, 39, 0.76);
    //   backdrop-filter: blur(14px);
    //   -webkit-backdrop-filter: blur(14px);
    //   box-shadow: 0 18px 40px rgba(6, 11, 22, 0.28);
    //   color: #ffffff;
    // }

    .clinic-map__pin {
      position: relative;
      width: 14px;
      height: 14px;
      flex: 0 0 14px;
      border-radius: 50%;
      background: #5b9fe0;
      box-shadow: 0 0 0 6px rgba(91, 159, 224, 0.18);
    }

    .clinic-map__pin::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
      background: #ffffff;
      opacity: 0.92;
    }

    .clinic-map__meta {
      display: flex;
      flex: 1 1 auto;
      min-width: 0;
      flex-direction: column;
      gap: 0.16rem;
    }

    .clinic-map__eyebrow {
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.68);
    }

    .clinic-map__label {
      font-size: 0.98rem;
      line-height: 1.3;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .clinic-map__coords {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .clinic-map__link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      padding: 0.72rem 1rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: #ffffff;
      text-decoration: none;
      font-size: 0.84rem;
      font-weight: 600;
      transition:
        background 180ms ease,
        transform 180ms ease,
        border-color 180ms ease;
    }

    .clinic-map__link:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.22);
      transform: translateY(-1px);
    }

    .clinic-map__link:focus-visible {
      outline: 2px solid rgba(91, 159, 224, 0.7);
      outline-offset: 2px;
    }

    // @media (max-width: 640px) {
    //   .clinic-map__panel {
    //     left: 0.75rem;
    //     right: 0.75rem;
    //     bottom: 0.75rem;
    //     flex-wrap: wrap;
    //     padding: 0.85rem 0.9rem;
    //     gap: 0.75rem;
    //   }

    //   .clinic-map__link {
    //     width: 100%;
    //   }
    // }
  `],
})
export class ClinicMap implements OnChanges {
  @Input() lat = 43.8498366;
  @Input() lng = 25.9523384;
  @Input() zoom = 16;
  @Input() label = 'Dr. Magdalena Mladenova';
  @Input() cid?: string;

  embedUrl!: SafeResourceUrl;
  directionsUrl = '';

  private sanitizer = inject(DomSanitizer);

  constructor() {
    this.updateUrls();
  }

  ngOnChanges(_: SimpleChanges): void {
    this.updateUrls();
  }

  private updateUrls(): void {
    const coordinates = `${this.lat},${this.lng}`;

    if (this.cid) {
      const embedParams = new URLSearchParams({
        cid: this.cid,
        output: 'embed',
      });

      this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://maps.google.com/maps?${embedParams.toString()}`,
      );
      this.directionsUrl = `https://maps.google.com/maps?cid=${this.cid}`;
      return;
    }

    const embedParams = new URLSearchParams({
      q: coordinates,
      z: String(this.zoom),
      output: 'embed',
    });

    const directionsParams = new URLSearchParams({
      api: '1',
      query: coordinates,
    });

    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?${embedParams.toString()}`,
    );
    this.directionsUrl = `https://www.google.com/maps/search/?${directionsParams.toString()}`;
  }
}
