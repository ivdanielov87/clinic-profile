import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, of } from 'rxjs';

export interface PriceItem {
  name: string;
  eur: string;
  bgn: string | null;
}

export interface PriceGroup {
  title: string;
  items: PriceItem[];
}

export interface Highlight {
  value: string;
  label: string;
}

export interface AboutContent {
  name: string;
  role: string;
  rating: number;
  ratingCount: number;
  bio: string[];
  highlights: Highlight[];
  qualifications: string[];
}

export interface ContactContent {
  superDocUrl: string;
  mapLat: number;
  mapLng: number;
  mapZoom: number;
  phone: string;
  email: string | null;
  addressLines: string[];
  workingHours: string[];
  notes: string[];
}

export interface Testimonial {
  initials: string;
  name: string;
  date: string;
  stars: number;
  text: string;
}

export interface SiteContent {
  about: AboutContent;
  contact: ContactContent;
  prices: PriceGroup[];
  testimonials: Testimonial[];
}

// BGN is shown until this date, EUR-only after
const BGN_SUNSET = new Date('2026-06-30');

const FALLBACK: SiteContent = {
  about: {
    name: 'Д-р Магдалена Младенова',
    role: 'ОФТАЛМОЛОГ · СПЕЦИАЛИСТ ОЧНИ БОЛЕСТИ',
    rating: 4.9,
    ratingCount: 811,
    bio: [
      '<strong>Д-р Магдалена Младенова</strong> е специалист офталмолог в Русе с над 15 години медицински опит. Завършва Медицински университет — Варна през 2012 г. и придобива специалност Очни болести през 2021 г.',
      'Извършва консултативни прегледи, диагностика, профилактика и лечение на широк спектър от очни заболявания с апаратура от последно поколение — включително ангио-ОСТ. Интересите са свързани с катаракта, глаукома, медицинска ретина и заболяванията на предния очен сегмент. Владее английски.',
    ],
    highlights: [
      { value: '15+',  label: 'Години опит' },
      { value: '2021', label: 'Специалност очни болести' }
    ],
    qualifications: [
      'Ехография',
      'Лазери в офталмологията',
      'Оптична кохерентна томография',
      'Интравитреално приложение на медикаменти',
      'Wet Lab',
      'Факоемулсификация — Виена 2019',
      'Европейско дружество по катарактна хирургия',
      'Българско дружество по офталмология',
    ],
  },
  contact: {
    superDocUrl: 'https://superdoc.bg/lekar/magdalena-mladenova',
    mapLat: 43.8498366,
    mapLng: 25.9523384,
    mapZoom: 17,
    phone: '0688 222 484',
    email: null,
    addressLines: ['ул. „Църковна независимост" 5', '7000 Русе'],
    workingHours: ['Понеделник – Петък: по записване'],
    notes: ['Работи с НЗОК · Приема деца над 8г.', 'Носете предходна медицинска документация'],
  },
  prices: [
    {
      title: 'Прегледи и консултации',
      items: [
        { name: 'Първичен преглед',       eur: '€40,00', bgn: '78.24 лв' },
        { name: 'Вторичен платен преглед', eur: '€25,00', bgn: '48.90 лв' },
      ],
    },
    {
      title: 'Инструментална диагностика',
      items: [
        { name: 'ОСТ (очен скенер) за 1 око',        eur: '€30,00', bgn: '58.67 лв' },
        { name: 'Измерване на ВОН',                   eur: '€5,00',  bgn: '9.78 лв'  },
        { name: 'Роговична топография — 1 око',       eur: '€26,00', bgn: '50.88 лв' },
        { name: 'Пахиметрия — 2 очи',                eur: '€15,00', bgn: '29.35 лв' },
        { name: 'Вземане на секрет за микробиология', eur: '€5,00',  bgn: '9.79 лв'  },
      ],
    },
    {
      title: 'Лазерна диагностика и лечение',
      items: [
        { name: 'YAG лазер (за 1 око)', eur: '€45,00', bgn: '88.10 лв'  },
        { name: 'SLT',                  eur: '€60,00', bgn: '117.40 лв' },
      ],
    },
  ],
  testimonials: [
    { initials: 'МС', name: 'Миглена С.',   date: '1 април 2026',    stars: 5, text: 'Впечатлена съм от отношението на докторката — ако всички лекари работеха като нея, здравеопазването ни щеше да бъде на друго ниво. Много внимателен и обстоен преглед.' },
    { initials: 'ЕН', name: 'Елица Н.',     date: '31 март 2026',    stars: 5, text: 'Заведох двете си деца на профилактичен преглед и останах с прекрасно впечатление — и като отношение, и като преглед. Беше мила, търпелива и ми обясни подробно всичко.' },
    { initials: 'МА', name: 'Марияна А.',   date: '11 март 2026',    stars: 5, text: 'Заведох на преглед баща ми на 79 години. Д-р Младенова проявява голяма човечност и търпение, рядко срещани в днешно време! Изключително обстоен преглед. Кабинетът е с много съвременна апаратура.' },
    { initials: 'ИИ', name: 'Иван И.',      date: '26 януари 2026',  stars: 5, text: 'За пръв път посещавам кабинета на д-р Младенова. Впечатлението ми е за висококвалифициран специалист. Останах приятно изненадан от професионалната техника с която разполага.' },
    { initials: 'МВ', name: 'Маргарита В.', date: '9 февруари 2026', stars: 5, text: 'Изключително добър млад специалист! Доволна съм от обстойния преглед — много внимателна и учтива. Впечатлена съм!' },
    { initials: 'ПК', name: 'Павел К.',     date: '11 февруари 2026',stars: 5, text: 'Професионално отношение, изчерпателно обяснение на всичко и приятна обстановка в кабинета. Много съм доволен.' },
  ],
};

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);

  private content$: Observable<SiteContent> = this.http
    .get<SiteContent>('content.json')
    .pipe(
      catchError(() => of(FALLBACK)),
      shareReplay(1),
    );

  getContent(): Observable<SiteContent> {
    return this.content$;
  }

  showBgn(): boolean {
    return new Date() <= BGN_SUNSET;
  }
}
