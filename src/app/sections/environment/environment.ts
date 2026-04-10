import { Component } from '@angular/core';
import { AnimateOnScrollDirective } from '../../core/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-environment',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './environment.html',
  styleUrl: './environment.scss',
})
export class Environment {
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
}
