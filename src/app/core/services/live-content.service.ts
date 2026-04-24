import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

export interface EarliestSlot {
  date: string;
  time: string;
  text: string;
}

export interface LiveReview {
  author: string;
  date: string;
  rating: number;
  text: string;
}

export interface LiveSuperDocData {
  earliestSlot: EarliestSlot | null;
  rating: number | null;
  ratingCount: number | null;
  reviews: LiveReview[];
  scrapedAt: string;
}

interface LiveSuperDocResponse extends Partial<LiveSuperDocData> {
  error?: string;
  message?: string;
}

const EMPTY: LiveSuperDocData = {
  earliestSlot: null,
  rating: null,
  ratingCount: null,
  reviews: [],
  scrapedAt: '',
};

const DEV_MOCK: LiveSuperDocData = {
  earliestSlot: {
    date: '2026-04-27',
    time: '09:45',
    text: '27 април 09:45',
  },
  rating: 4.94,
  ratingCount: 824,
  reviews: [
    { author: 'Ирена И.', date: '7 април 2026', rating: 5, text: 'Отлично отношение към пациента! Можеш да говориш и да ти обясни проблема! Внимателна, отзивчива и си спазва часовете.' },
    { author: 'Миглена С.', date: '1 април 2026', rating: 5, text: 'Впечатлена съм от отношението на докторката, ако всички лекари работеха така...' },
    { author: 'Стефка А.', date: '1 април 2026', rating: 5, text: 'Много добра и мила. Много добро отношение. Бих я посетила отново.' },
    { author: 'Величка Г.', date: '1 април 2026', rating: 5, text: 'Изключително доволна съм, благодаря.' },
    { author: 'Боряна В.', date: '31 март 2026', rating: 5, text: 'Прекрасен лекар! Препоръчвам.' },
    { author: 'Стела К.', date: '31 март 2026', rating: 5, text: 'Внимателна, любезна, търпелива.' },
  ],
  scrapedAt: new Date().toISOString(),
};

@Injectable({ providedIn: 'root' })
export class LiveContentService {
  private http = inject(HttpClient);

  private data$: Observable<LiveSuperDocData> = isDevMode()
    ? of(DEV_MOCK).pipe(shareReplay(1))
    : this.http.get<LiveSuperDocResponse>('/api/superdoc').pipe(
        map(response => {
          if (response.error) return EMPTY;
          return {
            earliestSlot: response.earliestSlot ?? null,
            rating: response.rating ?? null,
            ratingCount: response.ratingCount ?? null,
            reviews: response.reviews ?? [],
            scrapedAt: response.scrapedAt ?? '',
          };
        }),
        catchError(() => of(EMPTY)),
        shareReplay(1),
      );

  getLiveData(): Observable<LiveSuperDocData> {
    return this.data$;
  }

  /**
   * Format the earliest slot as a human-readable Bulgarian string.
   * SuperDoc already provides a `text` field (e.g. "27 април 09:45") —
   * we prefer it when available, and fall back to date/time assembly.
   */
  formatSlot(slot: EarliestSlot | null): string | null {
    if (!slot) return null;
    if (slot.text) return slot.text;
    return `${slot.date} ${slot.time}`;
  }
}
