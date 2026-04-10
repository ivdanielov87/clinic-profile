import { Component, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-environment',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './environment.html',
  styleUrl: './environment.scss',
})
export class Environment {
  openFeatureIndexes = signal<Set<number>>(new Set());
  currentGalleryIndex = signal(0);
  private touchStartX: number | null = null;
  private touchStartY: number | null = null;

  readonly features = [
    {
      title: 'Ангио-ОСТ скенер',
      desc: 'Детайлна образна диагностика на ретината, макулата и зрителния нерв с ангиографски режим',
    },
    {
      title: 'Авторефрактокератометър',
      desc: 'Автоматично измерване на диоптри и кривина на роговицата за секунди',
    },
    {
      title: 'Безконтактен тонометър',
      desc: 'Измерване на вътреочното налягане без допир за максимален комфорт на пациента',
    },
    {
      title: 'Биомикроскоп',
      desc: 'Детайлен преглед на предния и задния очен сегмент с висока точност',
    },
    {
      title: 'Фороптер за оптична корекция',
      desc: 'Бързо и прецизно предписване на очила за близо и далеч',
    },
    {
      title: 'YAG лазер и топография',
      desc: 'Пахиметрия, роговична топография и лазерни процедури в един кабинет',
    },
  ];

  readonly gallery = [
    {
      label: 'Приемна',
      area: 'reception',
      img: 'env-reception.jpg',
      title: 'Подредено и спокойно посрещане',
      desc: 'Ясна организация и удобен процес още от първите минути в кабинета.',
    },
    {
      label: 'ОСТ апаратура',
      area: 'ost',
      img: 'env-ost.jpg',
      title: 'Висок клас образна диагностика',
      desc: 'Ангио-ОСТ изследвания за по-детайлна оценка на ретина, макула и зрителен нерв.',
    },
    {
      label: 'Диагностика',
      area: 'diag',
      img: 'env-diag.jpg',
      title: 'Точни измервания без излишно забавяне',
      desc: 'Автоматизирани и безконтактни методи за комфорт и надеждност.',
    },
    {
      label: 'Чакалня',
      area: 'waiting',
      img: 'env-waiting.jpg',
      title: 'Спокойна среда за пациента',
      desc: 'Чисто, светло и премерено пространство, създадено с внимание към комфорта.',
    },
  ];

  get currentGalleryItem() {
    return this.gallery[this.currentGalleryIndex()];
  }

  toggleFeature(index: number): void {
    this.openFeatureIndexes.update(current => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  }

  isFeatureOpen(index: number): boolean {
    return this.openFeatureIndexes().has(index);
  }

  goToGallery(index: number): void {
    const normalized = Math.max(0, Math.min(index, this.gallery.length - 1));
    this.currentGalleryIndex.set(normalized);
  }

  prevGallery(): void {
    const current = this.currentGalleryIndex();
    this.currentGalleryIndex.set((current - 1 + this.gallery.length) % this.gallery.length);
  }

  nextGallery(): void {
    const current = this.currentGalleryIndex();
    this.currentGalleryIndex.set((current + 1) % this.gallery.length);
  }

  onGalleryTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onGalleryTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];

    if (!touch || this.touchStartX === null || this.touchStartY === null) {
      this.resetTouchState();
      return;
    }

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    this.resetTouchState();

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      this.nextGallery();
      return;
    }

    this.prevGallery();
  }

  private resetTouchState(): void {
    this.touchStartX = null;
    this.touchStartY = null;
  }
}
