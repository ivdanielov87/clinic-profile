import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';

export type AnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-right'
  | 'fade-left'
  | 'zoom-in'
  | 'fade'
  | 'clip-reveal'
  | 'blur-in';

@Directive({
  selector: '[animateOnScroll]',
  standalone: true,
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  /** Animation type */
  @Input('animateOnScroll') animationType: AnimationType = 'fade-up';

  /** Delay before the animation starts (ms) */
  @Input() animDelay: number = 0;

  /** Animation duration (ms) */
  @Input() animDuration: number = 550;

  /** IntersectionObserver threshold (0–1) */
  @Input() animThreshold: number = 0.15;

  private observer!: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    const el = this.el.nativeElement;

    // Apply base + type classes so CSS sets initial transform/opacity
    this.renderer.addClass(el, 'animate-on-scroll');
    this.renderer.addClass(el, this.animationType);
    el.style.transitionDuration = `${this.animDuration}ms`;
    if (this.animDelay > 0) {
      el.style.transitionDelay = `${this.animDelay}ms`;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(el, 'animated');
            this.observer.unobserve(el);
          }
        });
      },
      { threshold: this.animThreshold },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
