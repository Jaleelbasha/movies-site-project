import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { Movie } from '../../core/models/movie.interface';

type MoodType = 'feel-good' | 'action-fix' | 'mind-benders';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  template: `
    <div class="home">
      <header class="home__header">
        <h1>What Should I Watch Tonight?</h1>
        <p>Discover your next favorite movie based on your mood</p>
      </header>

      <div class="home__mood-buttons">
        <button
          *ngFor="let mood of moods"
          class="mood-button"
          [class.active]="selectedMood === mood.id"
          (click)="selectMood(mood.id)"
        >
          {{ mood.emoji }} {{ mood.label }}
        </button>
      </div>

      <div class="home__movies" *ngIf="movies.length">
        <h2>{{ getMoodTitle() }}</h2>
        <div class="movies-grid">
          <app-movie-card
            *ngFor="let movie of movies"
            [movie]="movie"
            (watchlistChange)="onWatchlistChange($event)"
          ></app-movie-card>
        </div>
      </div>

      <div class="home__loading" *ngIf="loading">
        Loading movies...
      </div>

      <div class="home__error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .home {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;

      &__header {
        text-align: center;
        margin-bottom: 2rem;

        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        p {
          font-size: 1.2rem;
          color: #666;
        }
      }

      &__mood-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      &__movies {
        h2 {
          margin-bottom: 1rem;
        }
      }

      &__loading,
      &__error {
        text-align: center;
        padding: 2rem;
      }

      &__error {
        color: #dc3545;
      }
    }

    .mood-button {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      background: #f0f0f0;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.2s;

      &:hover {
        background: #e0e0e0;
        transform: translateY(-2px);
      }

      &.active {
        background: #007bff;
        color: white;
      }
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .home {
        padding: 1rem;

        &__header {
          h1 {
            font-size: 2rem;
          }
        }

        &__mood-buttons {
          flex-direction: column;
          align-items: stretch;
        }
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  moods = [
    { id: 'feel-good' as MoodType, label: 'Feel Good', emoji: '😊' },
    { id: 'action-fix' as MoodType, label: 'Action Fix', emoji: '💥' },
    { id: 'mind-benders' as MoodType, label: 'Mind Benders', emoji: '🤯' }
  ];

  movies: Movie[] = [];
  selectedMood: MoodType | null = null;
  loading = false;
  error: string | null = null;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadPopularMovies();
  }

  loadPopularMovies(): void {
    this.loading = true;
    this.error = null;
    this.movieService.getPopularMovies().subscribe({
      next: (response) => {
        this.movies = response.results;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load movies. Please try again later.';
        this.loading = false;
        console.error('Error loading movies:', err);
      }
    });
  }

  selectMood(mood: MoodType): void {
    this.selectedMood = mood;
    this.loading = true;
    this.error = null;

    this.movieService.getMoviesByMood(mood).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load movies. Please try again later.';
        this.loading = false;
        console.error('Error loading movies by mood:', err);
      }
    });
  }

  getMoodTitle(): string {
    if (!this.selectedMood) {
      return 'Popular Movies';
    }
    const mood = this.moods.find(m => m.id === this.selectedMood);
    return mood ? `${mood.emoji} ${mood.label} Movies` : 'Movies';
  }

  onWatchlistChange(event: { movie: Movie; action: 'add' | 'remove' }): void {
    // You can add notifications or other UI feedback here
    console.log(`Movie ${event.action}ed to watchlist:`, event.movie.title);
  }
} 