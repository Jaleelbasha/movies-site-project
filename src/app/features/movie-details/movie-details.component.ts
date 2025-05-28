import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeStyle } from '@angular/platform-browser';
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
      <div class="backdrop" [style]="backdropStyle"></div>
      <div class="movie-details__content">
        <div class="movie-details__header">
          <img [src]="posterUrl" [alt]="movie.title" class="movie-details__poster" (error)="onImageError($event)" />
          <div class="movie-details__info">
            <h1>{{ movie.title }}</h1>
            <p class="tagline">{{ movie.tagline }}</p>
            <div class="genres">
              <span *ngFor="let genre of movie.genres">{{ genre.name }}</span>
            </div>
            <p class="overview">{{ movie.overview }}</p>
            <div class="metadata">
              <span>{{ movie.release_date | date:'mediumDate' }}</span>
              <span>{{ movie.runtime }} minutes</span>
              <span>{{ movie.vote_average }}/10</span>
            </div>
            <button (click)="toggleWatchlist()" class="watchlist-button">
              {{ isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist' }}
            </button>
          </div>
        </div>

        <div class="cast-section" *ngIf="movie.credits?.cast?.length">
          <h2>Cast</h2>
          <div class="cast-list">
            <div *ngFor="let actor of movie.credits.cast" class="cast-member">
              <img [src]="getProfileUrl(actor.profile_path)" [alt]="actor.name" (error)="onProfileImageError($event)" />
              <div class="cast-info">
                <span class="actor-name">{{ actor.name }}</span>
                <span class="character-name">{{ actor.character }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="trailer-section" *ngIf="trailerUrl">
          <h2>Trailer</h2>
          <iframe
            [src]="trailerUrl"
            frameborder="0"
            allowfullscreen
            class="trailer-iframe"
          ></iframe>
        </div>

        <div class="similar-movies" *ngIf="similarMovies?.length">
          <h2>Similar Movies</h2>
          <div class="similar-movies-grid">
            <div *ngFor="let similar of similarMovies" class="similar-movie">
              <img [src]="getPosterUrl(similar.poster_path)" [alt]="similar.title" (error)="onImageError($event)" />
              <h3>{{ similar.title }}</h3>
              <p>{{ similar.release_date | date:'y' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading">Loading...</div>
    <div *ngIf="error" class="error">{{ error }}</div>
  `,
  styles: [`
    .movie-details {
      position: relative;
      min-height: 100vh;
    }

    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background-size: cover;
      background-position: center;
      filter: brightness(0.3);
      z-index: -1;
    }

    .movie-details__content {
      padding: 2rem;
      color: white;
      position: relative;
      z-index: 1;
    }

    .movie-details__header {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .movie-details__poster {
      width: 300px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .movie-details__info {
      flex: 1;
    }

    .tagline {
      font-style: italic;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .genres {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .genres span {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
    }

    .metadata {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .cast-section {
      margin: 2rem 0;
    }

    .cast-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .cast-member {
      text-align: center;
    }

    .cast-member img {
      width: 120px;
      height: 180px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .trailer-section {
      margin: 2rem 0;
    }

    .trailer-iframe {
      width: 100%;
      height: 500px;
      border-radius: 8px;
    }

    .similar-movies {
      margin: 2rem 0;
    }

    .similar-movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }

    .similar-movie {
      text-align: center;
    }

    .similar-movie img {
      width: 100%;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-size: 1.5rem;
      color: white;
    }

    .error {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-size: 1.5rem;
      color: red;
    }

    .watchlist-button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background: #e50914;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    }

    .watchlist-button:hover {
      background: #f40612;
    }
  `]
})
export class MovieDetailsComponent implements OnInit {
  movie: MovieDetails | null = null;
  similarMovies: Movie[] = [];
  loading = true;
  error: string | null = null;
  isInWatchlist = false;
  backdropStyle: SafeStyle | null = null;
  posterUrl: SafeResourceUrl | null = null;
  trailerUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private watchlistService: WatchlistService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovieDetails(movieId);
    }
  }

  private loadMovieDetails(movieId: string): void {
    this.loading = true;
    this.error = null;

    this.movieService.getMovieDetails(Number(movieId)).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.setBackdropStyle();
        this.setPosterUrl();
        this.setTrailerUrl();
        this.checkWatchlistStatus();
        this.loadSimilarMovies(movieId);
      },
      error: (error) => {
        this.error = 'Failed to load movie details';
        this.loading = false;
      }
    });
  }

  private loadSimilarMovies(movieId: string): void {
    this.movieService.getSimilarMovies(Number(movieId)).subscribe({
      next: (response) => {
        this.similarMovies = response.results;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load similar movies';
        this.loading = false;
      }
    });
  }

  private setBackdropStyle(): void {
    if (this.movie?.backdrop_path) {
      const backdropUrl = `${environment.tmdbImageUrl}/original${this.movie.backdrop_path}`;
      this.backdropStyle = this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${backdropUrl}")`);
    } else {
      this.backdropStyle = this.sanitizer.bypassSecurityTrustStyle('none');
    }
  }

  private setPosterUrl(): void {
    if (this.movie?.poster_path) {
      const posterUrl = `${environment.tmdbImageUrl}/w500${this.movie.poster_path}`;
      this.posterUrl = this.sanitizer.bypassSecurityTrustResourceUrl(posterUrl);
    } else {
      this.posterUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/assets/images/no-poster.jpg');
    }
  }

  private setTrailerUrl(): void {
    const trailer = this.movie?.videos?.results?.find(
      (video: any) => video.site === 'YouTube' && video.type === 'Trailer'
    );
    if (trailer) {
      const trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(trailerUrl);
    } else {
      this.trailerUrl = null;
    }
  }

  getPosterUrl(posterPath: string | null): SafeResourceUrl {
    if (posterPath) {
      const url = `${environment.tmdbImageUrl}/w500${posterPath}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl('/assets/images/no-poster.jpg');
  }

  getProfileUrl(profilePath: string | null): SafeResourceUrl {
    if (profilePath) {
      const url = `${environment.tmdbImageUrl}/w185${profilePath}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl('/assets/images/no-profile.jpg');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/no-poster.jpg';
  }

  onProfileImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/no-profile.jpg';
  }

  private checkWatchlistStatus(): void {
    if (this.movie) {
      this.isInWatchlist = this.watchlistService.isInWatchlist(this.movie.id);
    }
  }

  toggleWatchlist(): void {
    if (this.movie) {
      if (this.isInWatchlist) {
        this.watchlistService.removeFromWatchlist(this.movie.id);
      } else {
        this.watchlistService.addToWatchlist(this.movie);
      }
      this.checkWatchlistStatus();
    }
  }
} 