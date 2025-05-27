import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Movie } from '../../../core/models/movie.interface';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="movie-card">
      <div class="movie-card__image">
        <img
          [src]="getImageUrl(movie.poster_path)"
          [alt]="movie.title"
          (error)="onImageError($event)"
        />
      </div>
      <div class="movie-card__content">
        <h3 class="movie-card__title">{{ movie.title }}</h3>
        <div class="movie-card__info">
          <span class="movie-card__year">{{ getYear(movie.release_date) }}</span>
          <span class="movie-card__rating">⭐ {{ movie.vote_average.toFixed(1) }}</span>
        </div>
        <div class="movie-card__actions">
          <button
            class="movie-card__button"
            [routerLink]="['/movie', movie.id]"
          >
            Details
          </button>
          <button
            class="movie-card__button"
            [class.movie-card__button--active]="isInWatchlist"
            (click)="onWatchlistClick()"
          >
            {{ isInWatchlist ? '❤️' : '🤍' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movie-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
      }

      &__image {
        position: relative;
        padding-top: 150%;

        img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      &__content {
        padding: 1rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
      }

      &__title {
        margin: 0 0 0.5rem;
        font-size: 1rem;
        font-weight: 600;
      }

      &__info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #666;
      }

      &__actions {
        margin-top: auto;
        display: flex;
        gap: 0.5rem;
      }

      &__button {
        flex: 1;
        padding: 0.5rem;
        border: none;
        border-radius: 4px;
        background: #f0f0f0;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background: #e0e0e0;
        }

        &--active {
          background: #ffebee;
        }
      }
    }
  `]
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Output() watchlistChange = new EventEmitter<{ movie: Movie; action: 'add' | 'remove' }>();

  constructor(private watchlistService: WatchlistService) {}

  get isInWatchlist(): boolean {
    return this.watchlistService.isInWatchlist(this.movie.id);
  }

  getImageUrl(path: string): string {
    return path
      ? `${environment.tmdbImageUrl}/w500${path}`
      : 'assets/images/no-poster.jpg';
  }

  getYear(date: string): string {
    return date ? new Date(date).getFullYear().toString() : 'N/A';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/no-poster.jpg';
  }

  onWatchlistClick(): void {
    if (this.isInWatchlist) {
      this.watchlistService.removeFromWatchlist(this.movie.id);
      this.watchlistChange.emit({ movie: this.movie, action: 'remove' });
    } else {
      this.watchlistService.addToWatchlist(this.movie);
      this.watchlistChange.emit({ movie: this.movie, action: 'add' });
    }
  }
} 