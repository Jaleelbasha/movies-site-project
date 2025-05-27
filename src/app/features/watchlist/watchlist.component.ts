import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistService } from '../../core/services/watchlist.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { Movie } from '../../core/models/movie.interface';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  template: `
    <div class="watchlist">
      <header class="watchlist__header">
        <h1>My Watchlist</h1>
        <p *ngIf="movies.length">{{ movies.length }} movies saved</p>
      </header>

      <div class="watchlist__content" *ngIf="movies.length">
        <div class="movies-grid">
          <app-movie-card
            *ngFor="let movie of movies"
            [movie]="movie"
            (watchlistChange)="onWatchlistChange($event)"
          ></app-movie-card>
        </div>
      </div>

      <div class="watchlist__empty" *ngIf="!movies.length">
        <p>Your watchlist is empty</p>
        <button routerLink="/" class="watchlist__browse-btn">
          Browse Movies
        </button>
      </div>
    </div>
  `,
  styles: [`
    .watchlist {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;

      &__header {
        text-align: center;
        margin-bottom: 2rem;

        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        p {
          color: #666;
        }
      }

      &__empty {
        text-align: center;
        padding: 4rem 0;
        color: #666;

        p {
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }
      }

      &__browse-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        background: #007bff;
        color: white;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s;

        &:hover {
          background: #0056b3;
        }
      }
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .watchlist {
        padding: 1rem;

        &__header {
          h1 {
            font-size: 2rem;
          }
        }
      }
    }
  `]
})
export class WatchlistComponent implements OnInit {
  movies: Movie[] = [];

  constructor(private watchlistService: WatchlistService) {}

  ngOnInit(): void {
    this.watchlistService.getWatchlist().subscribe(movies => {
      this.movies = movies;
    });
  }

  onWatchlistChange(event: { movie: Movie; action: 'add' | 'remove' }): void {
    if (event.action === 'remove') {
      this.movies = this.movies.filter(m => m.id !== event.movie.id);
    }
  }
} 