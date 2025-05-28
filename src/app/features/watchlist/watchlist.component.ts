import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WatchlistService } from '../../core/services/watchlist.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { Movie } from '../../core/models/movie.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCardComponent],
  template: `
    <div class="watchlist">
      <h1>My Watchlist</h1>
      
      <div class="watchlist__content" *ngIf="movies.length; else emptyState">
        <p class="watchlist__count">{{ movies.length }} {{ movies.length === 1 ? 'movie' : 'movies' }} saved</p>
        <div class="movies-grid">
          <app-movie-card
            *ngFor="let movie of movies"
            [movie]="movie"
            (watchlistChange)="onWatchlistChange($event)"
          ></app-movie-card>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <p>Your watchlist is empty</p>
          <a routerLink="/" class="browse-btn">Browse Movies</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .watchlist {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;

      h1 {
        margin-bottom: 2rem;
        color: #333;
      }
    }

    .watchlist__count {
      margin-bottom: 1.5rem;
      color: #6c757d;
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 2rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #f8f9fa;
      border-radius: 8px;

      p {
        font-size: 1.2rem;
        color: #6c757d;
        margin-bottom: 1.5rem;
      }

      .browse-btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.2s;

        &:hover {
          background: #0056b3;
        }
      }
    }
  `]
})
export class WatchlistComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  private destroy$ = new Subject<void>();

  constructor(private watchlistService: WatchlistService) {}

  ngOnInit(): void {
    this.loadWatchlist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWatchlist(): void {
    this.watchlistService.getWatchlist()
      .pipe(takeUntil(this.destroy$))
      .subscribe(movies => {
        this.movies = movies;
      });
  }

  onWatchlistChange(event: { movie: Movie; action: 'add' | 'remove' }): void {
    if (event.action === 'remove') {
      this.movies = this.movies.filter(m => m.id !== event.movie.id);
    }
  }
} 