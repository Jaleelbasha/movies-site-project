import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective {
  @Output() scrolled = new EventEmitter<void>();

  private scrollThreshold = 0.8;

  constructor(private el: ElementRef) {}

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isScrollNearBottom()) {
      this.scrolled.emit();
    }
  }

  private isScrollNearBottom(): boolean {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollPercentage = (scrollTop + windowHeight) / documentHeight;
    
    return scrollPercentage > this.scrollThreshold;
  }
} 