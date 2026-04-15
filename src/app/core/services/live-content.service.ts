import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

export interface EarliestSlot {
  date: string;
  time: string;
  text: string;
}

export interface LiveSuperDocData {
  earliestSlot: EarliestSlot | null;
  rating: number | null;
  ratingCount: number | null;
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
  scrapedAt: '',
};

@Injectable({ providedIn: 'root' })
export class LiveContentService {
  private http = inject(HttpClient);

  private data$: Observable<LiveSuperDocData> = this.http
    .get<LiveSuperDocResponse>('/api/superdoc')
    .pipe(
      map(response => {
        if (response.error) return EMPTY;
        return {
          earliestSlot: response.earliestSlot ?? null,
          rating: response.rating ?? null,
          ratingCount: response.ratingCount ?? null,
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
