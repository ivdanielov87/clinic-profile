import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-clinic-map',
  standalone: true,
  template: `<div #mapEl class="clinic-map"></div>`,
  styles: [`
    :host { display: block; height: 100%; }
    .clinic-map { width: 100%; height: 100%; }
  `],
})
export class ClinicMap implements AfterViewInit, OnChanges, OnDestroy {
  @Input() lat = 43.8498366;
  @Input() lng = 25.9523384;
  @Input() zoom = 16;
  @Input() label = 'Д-р Магдалена Младенова';

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  private map: any;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initMap(), 50);
    }
  }

  ngOnChanges(): void {
    if (this.map) {
      this.map.setView([this.lat, this.lng], this.zoom);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private async initMap(): Promise<void> {
    const L = await import('leaflet');

    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;

    const el = this.mapEl.nativeElement;

    this.map = L.map(el, {
      center: [this.lat, this.lng],
      zoom: this.zoom,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map);

    const markerIcon = L.divIcon({
      html: `<div style="
        width:22px; height:22px;
        background:#1B2E4B;
        border:3px solid rgba(255,255,255,0.9);
        border-radius:50%;
        box-shadow:0 0 0 4px rgba(47,111,191,0.35), 0 4px 16px rgba(27,46,75,0.6);
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      className: '',
    });

    const marker = L.marker([this.lat, this.lng], { icon: markerIcon }).addTo(this.map);

    marker.bindPopup(L.popup({
      closeButton: false,
      offset: [0, -12],
      className: 'clinic-popup',
    }).setContent(`
      <div style="font-family:'Inter',system-ui,sans-serif;padding:2px 0;min-width:190px;">
        <div style="font-weight:700;color:#1B2E4B;font-size:13px;margin-bottom:5px;">Д-р Магдалена Младенова</div>
        <div style="font-size:11px;color:#6B7A8D;line-height:1.6;">
          ул. „Църковна независимост" 5<br>7000 Русе, България
        </div>
      </div>
    `)).openPopup();

    this.map.invalidateSize();
  }
}
