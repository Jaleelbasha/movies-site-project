import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.interface';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

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
          <div class="search__loading" *ngIf="loading">Searching...</div>
        </div>
      </div>

      <div class="search__content">
        <div class="search__error" *ngIf="error">{{ error }}</div>
        <div class="search__results" *ngIf="movies.length">
          <div class="movies-grid">
            <app-movie-card
              *ngFor="let movie of movies"
              [movie]="movie"
              (watchlistChange)="onWatchlistChange($event)"
            ></app-movie-card>
          </div>
        </div>
        <div class="search__no-results" *ngIf="!movies.length && !error && searchQuery">
          No movies found for "{{ searchQuery }}"
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;

      &__header {
        margin-bottom: 2rem;
        text-align: center;

        h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #333;
        }
      }

      &__input-wrapper {
        position: relative;
        max-width: 600px;
        margin: 0 auto;
      }

      &__input {
        width: 100%;
        padding: 1rem;
        font-size: 1.1rem;
        border: 2px solid #ddd;
        border-radius: 4px;
        transition: border-color 0.2s;

        &:focus {
          outline: none;
          border-color: #007bff;
        }
      }

      &__loading {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #6c757d;
      }

      &__error {
        text-align: center;
        color: #dc3545;
        margin-bottom: 2rem;
      }

      &__no-results {
        text-align: center;
        color: #6c757d;
        font-size: 1.2rem;
      }

      .movies-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 2rem;
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
  private destroy$ = new Subject<void>();

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    if (!query.trim()) {
      this.movies = [];
      this.loading = false;
      this.error = null;
      return;
    }
    this.loading = true;
    this.searchSubject.next(query);
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (!query.trim()) {
        this.movies = [];
        this.loading = false;
        this.error = null;
        return;
      }
      this.searchMovies(query);
    });
  }

  private searchMovies(query: string): void {
    if (!query.trim()) {
      this.movies = [];
      this.loading = false;
      this.error = null;
      return;
    }

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
        this.movies = [];
        console.error('Error searching movies:', err);
      }
    });
  }

  onWatchlistChange(event: { movie: Movie; action: 'add' | 'remove' }): void {
    if (event.action === 'add') {
      console.log('Movie added to watchlist:', event.movie.title);
    } else {
      console.log('Movie removed from watchlist:', event.movie.title);
    }
  }
} 