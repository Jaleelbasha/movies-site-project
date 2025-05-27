import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../core/services/movie.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { MovieDetails, Movie } from '../../core/models/movie.interface';
import { environment } from '../../../environments/environment';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  template: `
    <div class="movie-details" *ngIf="movie">
      <div class="movie-details__backdrop" [style.backgroundImage]="getBackdropUrl()">
        <div class="movie-details__overlay"></div>
      </div>

      <div class="movie-details__content">
        <div class="movie-details__header">
          <img
            [src]="getPosterUrl(movie.poster_path)"
            [alt]="movie.title"
            class="movie-details__poster"
            (error)="onImageError($event)"
          />
          
          <div class="movie-details__info">
            <h1>{{ movie.title }}</h1>
            <div class="movie-details__meta">
              <span>{{ getYear(movie.release_date) }}</span>
              <span>{{ movie.runtime }} min</span>
              <span>⭐ {{ movie.vote_average.toFixed(1) }}</span>
            </div>
            
            <div class="movie-details__genres">
              <span *ngFor="let genre of movie.genres">{{ genre.name }}</span>
            </div>

            <p class="movie-details__tagline">{{ movie.tagline }}</p>
            <p class="movie-details__overview">{{ movie.overview }}</p>

            <button
              class="movie-details__watchlist-btn"
              [class.active]="isInWatchlist"
              (click)="toggleWatchlist()"
            >
              {{ isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist' }}
            </button>
          </div>
        </div>

        <div class="movie-details__trailer" *ngIf="trailerUrl">
          <h2>Trailer</h2>
          <iframe
            [src]="trailerUrl"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>

        <div class="movie-details__cast" *ngIf="movie.credits?.cast?.length">
          <h2>Cast</h2>
          <div class="cast-list">
            <div class="cast-item" *ngFor="let actor of movie.credits.cast.slice(0, 6)">
              <img
                [src]="getProfileUrl(actor.profile_path)"
                [alt]="actor.name"
                (error)="onProfileImageError($event)"
              />
              <h3>{{ actor.name }}</h3>
              <p>{{ actor.character }}</p>
            </div>
          </div>
        </div>

        <div class="movie-details__similar" *ngIf="similarMovies.length">
          <h2>Similar Movies</h2>
          <div class="similar-movies">
            <app-movie-card
              *ngFor="let movie of similarMovies"
              [movie]="movie"
              (watchlistChange)="onWatchlistChange($event)"
            ></app-movie-card>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="loading">Loading...</div>
    <div class="error" *ngIf="error">{{ error }}</div>
  `,
  styles: [`
    .movie-details {
      position: relative;
      min-height: 100vh;

      &__backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-size: cover;
        background-position: center;
        z-index: -1;
      }

      &__overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
      }

      &__content {
        position: relative;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        color: black;
      }

      &__header {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
      }

      &__poster {
        width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      }

      &__info {
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
      }

      &__meta {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        color: #ccc;
      }

      &__genres {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;

        span {
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          font-size: 0.875rem;
        }
      }

      &__tagline {
        font-style: italic;
        color: #ccc;
        margin-bottom: 1rem;
      }

      &__overview {
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      &__watchlist-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        background: #007bff;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background: #0056b3;
        }

        &.active {
          background: #dc3545;
        }
      }

      &__trailer {
        margin-bottom: 2rem;

        h2 {
          margin-bottom: 1rem;
        }

        iframe {
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
          border-radius: 8px;
        }
      }

      &__cast {
        margin-bottom: 2rem;

        h2 {
          margin-bottom: 1rem;
        }
      }
    }

    .cast-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .cast-item {
      text-align: center;

      img {
        width: 100%;
        aspect-ratio: 2/3;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }

      h3 {
        font-size: 1rem;
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.875rem;
        color: #ccc;
      }
    }

    .similar-movies {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .loading,
    .error {
      text-align: center;
      padding: 2rem;
      color: white;
    }

    .error {
      color: #dc3545;
    }

    @media (max-width: 768px) {
      .movie-details {
        &__header {
          grid-template-columns: 1fr;
        }

        &__poster {
          max-width: 300px;
          margin: 0 auto;
        }
      }
    }
  `]
})
export class MovieDetailsComponent implements OnInit {
  movie: MovieDetails | null = null;
  similarMovies: Movie[] = [];
  trailerUrl: SafeResourceUrl | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private watchlistService: WatchlistService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => this.movieService.getMovieDetails(params['id']))
    ).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loading = false;
        this.setTrailerUrl();
        this.loadSimilarMovies();
      },
      error: (err) => {
        this.error = 'Failed to load movie details. Please try again later.';
        this.loading = false;
        console.error('Error loading movie details:', err);
      }
    });
  }

  get isInWatchlist(): boolean {
    return this.movie ? this.watchlistService.isInWatchlist(this.movie.id) : false;
  }

  toggleWatchlist(): void {
    if (!this.movie) return;

    if (this.isInWatchlist) {
      this.watchlistService.removeFromWatchlist(this.movie.id);
    } else {
      this.watchlistService.addToWatchlist(this.movie);
    }
  }

  getBackdropUrl(): string {
    if (!this.movie?.backdrop_path) return 'none';
    return `url(${environment.tmdbImageUrl}/original${this.movie.backdrop_path})`;
  }

  getPosterUrl(path: string): string {
    return path
      ? `${environment.tmdbImageUrl}/w500${path}`
      : 'assets/images/no-poster.jpg';
  }

  getProfileUrl(path: string): string {
    return path
      ? `${environment.tmdbImageUrl}/w185${path}`
      : 'assets/images/no-profile.jpg';
  }

  getYear(date: string): string {
    return date ? new Date(date).getFullYear().toString() : 'N/A';
  }

  private setTrailerUrl(): void {
    if (!this.movie?.videos?.results) return;

    const trailer = this.movie.videos.results.find(
      video => video.site === 'YouTube' && video.type === 'Trailer'
    );

    if (trailer) {
      this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${trailer.key}`
      );
    }
  }

  private loadSimilarMovies(): void {
    if (!this.movie) return;

    this.movieService.getSimilarMovies(this.movie.id).subscribe({
      next: (response) => {
        this.similarMovies = response.results.slice(0, 6);
      },
      error: (err) => {
        console.error('Error loading similar movies:', err);
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/no-poster.jpg';
  }

  onProfileImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/no-profile.jpg';
  }

  onWatchlistChange(event: { movie: Movie; action: 'add' | 'remove' }): void {
    console.log(`Similar movie ${event.action}ed to watchlist:`, event.movie.title);
  }
} 