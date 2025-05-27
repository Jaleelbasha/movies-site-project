import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MovieService } from '../../core/services/movie.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { Movie } from '../../core/models/movie.interface';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCardComponent],
  template: `
    <div class="search">
      <div class="search__header">
        <h1>Search Movies</h1>
        <div class="search__input-wrapper">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search for movies..."
            class="search__input"
          />
          <span class="search__icon">🔍</span>
        </div>
      </div>

      <div class="search__results" *ngIf="movies.length">
        <h2>Search Results</h2>
        <div class="movies-grid">
          <app-movie-card
            *ngFor="let movie of movies"
            [movie]="movie"
            (watchlistChange)="onWatchlistChange($event)"
          ></app-movie-card>
        </div>
      </div>

      <div class="search__empty" *ngIf="!loading && searchQuery && !movies.length">
        No movies found for "{{ searchQuery }}"
      </div>

      <div class="search__loading" *ngIf="loading">
        Searching...
      </div>

      <div class="search__error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .search {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;

      &__header {
        text-align: center;
        margin-bottom: 2rem;

        h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }
      }

      &__input-wrapper {
        position: relative;
        max-width: 600px;
        margin: 0 auto;
      }

      &__input {
        width: 100%;
        padding: 1rem 1rem 1rem 3rem;
        font-size: 1.1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        transition: border-color 0.2s;

        &:focus {
          outline: none;
          border-color: #007bff;
        }
      }

      &__icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.2rem;
      }

      &__results {
        h2 {
          margin-bottom: 1rem;
        }
      }

      &__empty,
      &__loading,
      &__error {
        text-align: center;
        padding: 2rem;
        color: #666;
      }

      &__error {
        color: #dc3545;
      }
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .search {
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
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  movies: Movie[] = [];
  loading = false;
  error: string | null = null;

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query.trim()) {
          this.searchMovies(query);
        } else {
          this.movies = [];
        }
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  private searchMovies(query: string): void {
    this.loading = true;
    this.error = null;

    this.movieService.searchMovies(query).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to search movies. Please try again later.';
        this.loading = false;
        console.error('Error searching movies:', err);
      }
    });
  }

  onWatchlistChange(event: { movie: Movie; action: 'add' | 'remove' }): void {
    console.log(`Movie ${event.action}ed to watchlist:`, event.movie.title);
  }
} 