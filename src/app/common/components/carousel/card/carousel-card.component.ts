/**
 * Carousel card component -
 * Presentational card that holds a carousel entity.
 * Be sure to provide all inputs.
 * @author Ben Hayward
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'm-carousel__card',
  template: `
    <div class="m-carousel-card__wrapper">
      <div
        class="m-carousel-card__avatar"
        [ngStyle]="imageStyle"
        [routerLink]="contentLink"
      ></div>
      <span class="m-carousel-card__name" [routerLink]="contentLink">
        {{ title }}
      </span>
      <button class="m-carousel-card__button" (click)="buttonClick.emit(true)">
        {{ buttonText }}
      </button>
    </div>
  `,
})
export class CarouselCardComponent {
  @Input() imageStyle; // background-image object to be passed to ngStyle.
  @Input() contentLink; // where content clicks should like.
  @Input() title; // the title of the card.
  @Input() buttonText; // text for the button (handled in service).
  @Output() buttonClick = new EventEmitter<boolean>(); // emits on button click.
}
