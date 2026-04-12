import { Component, signal } from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  private readonly expandedCards = signal<Set<number | 'more'>>(new Set());

  readonly items = [
    {
      tag: 'Консултация',
      title: 'Пълен очен преглед',
      icon: 'exam',
      image: 'services-exam.jpg',
      imageAlt: 'Професионална офталмологична диагностика с модерна апаратура',
      desc: 'Комплексна проверка на зрителната острота, рефракция и здравето на окото, включително преден и заден сегмент.',
    },
    {
      tag: 'Оптична корекция',
      title: 'Измерване на диоптри',
      icon: 'refraction',
      image: 'services-refraction.jpg',
      imageAlt: 'Фороптер и прецизна апаратура за измерване на зрението',
      desc: 'Прецизно авторефрактометрично измерване и подбор на оптична корекция с фороптер за близо и далеч.',
    },
    {
      tag: 'Глаукома',
      title: 'Измерване на ВОН',
      icon: 'pressure',
      image: 'services-pressure.jpg',
      imageAlt: 'Съвременна апаратура за очни прегледи в клинична среда',
      desc: 'Безконтактно измерване на вътреочното налягане за ранна диагностика на глаукома по бърз и комфортен начин.',
    },
    {
      tag: 'Ретина',
      title: 'Ангио-ОСТ скенер',
      icon: 'oct',
      image: 'services-oct.jpg',
      imageAlt: 'Ангио-ОСТ и модерна ретинна диагностика',
      desc: 'Оптична кохерентна томография с детайлни изображения на ретината, макулата и зрителния нерв.',
    },
    {
      tag: 'Лазери',
      title: 'YAG лазер и SLT',
      icon: 'laser',
      image: 'services-laser.jpg',
      imageAlt: 'Офталмологичен кабинет с апаратура за прецизни процедури',
      desc: 'Лазерни процедури в офталмологията за лечение на глаукома, вторична катаракта и ретинни проблеми.',
    },
    {
      tag: 'Детски преглед',
      title: 'Деца над 8 години',
      icon: 'pediatric',
      image: 'services-pediatric.jpg',
      imageAlt: 'Спокойна и добре оборудвана среда за очни прегледи',
      desc: 'Специализирани прегледи за деца, профилактика и лечение на амблиопия с внимание към индивидуалните нужди.',
    },
  ];

  readonly moreCard = {
    tag: 'И още...',
    title: 'Допълнителни консултации и проследяване',
    icon: 'followup',
    desc: 'Извършваме още контролни прегледи, комбинирани изследвания, второ мнение и индивидуален план според конкретните оплаквания и история.',
  };

  isExpanded(cardKey: number | 'more'): boolean {
    return this.expandedCards().has(cardKey);
  }

  toggleExpanded(cardKey: number | 'more'): void {
    this.expandedCards.update(current => {
      const next = new Set(current);

      if (next.has(cardKey)) {
        next.delete(cardKey);
      } else {
        next.add(cardKey);
      }

      return next;
    });
  }
}
