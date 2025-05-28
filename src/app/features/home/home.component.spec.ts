import { ComponentFixture } from '@angular/core/testing';
import { render, screen, fireEvent } from '@testing-library/angular';
import { HomeComponent } from './home.component';
import { MovieService } from '../../core/services/movie.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { of, throwError, Subject } from 'rxjs';
import { Movie } from '../../core/models/movie.interface';
import { RouterTestingModule } from '@angular/router/testing';
import { WatchlistService } from '../../core/services/watchlist.service';

describe('HomeComponent', () => {
  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Test Movie 1',
      overview: 'Test Overview 1',
      poster_path: '/test1.jpg',
      backdrop_path: '/test-backdrop1.jpg',
      release_date: '2024-01-01',
      vote_average: 7.5,
      vote_count: 1000,
      genre_ids: [28, 12]
    },
    {
      id: 2,
      title: 'Test Movie 2',
      overview: 'Test Overview 2',
      poster_path: '/test2.jpg',
      backdrop_path: '/test-backdrop2.jpg',
      release_date: '2024-01-02',
      vote_average: 8.0,
      vote_count: 2000,
      genre_ids: [35, 10751]
    }
  ];

  const mockMovieService = {
    getPopularMovies: jest.fn(),
    getMoviesByMood: jest.fn()
  };

  const mockWatchlistService = {
    isInWatchlist: jest.fn(),
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMovieService.getPopularMovies.mockReturnValue(of({ results: mockMovies }));
    mockMovieService.getMoviesByMood.mockReturnValue(of({ results: mockMovies }));
  });

  const setup = async () => {
    return render(HomeComponent, {
      componentProviders: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: WatchlistService, useValue: mockWatchlistService }
      ],
      imports: [MovieCardComponent, RouterTestingModule]
    });
  };

  it('should create', async () => {
    const { container } = await setup();
    expect(container).toBeTruthy();
  });

  it('should display header with title and description', async () => {
    await setup();
    expect(screen.getByText('What Should I Watch Tonight?')).toBeInTheDocument();
    expect(screen.getByText('Discover your next favorite movie based on your mood')).toBeInTheDocument();
  });

  it('should display mood buttons', async () => {
    await setup();
    expect(screen.getByText('😊 Feel Good')).toBeInTheDocument();
    expect(screen.getByText('💥 Action Fix')).toBeInTheDocument();
    expect(screen.getByText('🤯 Mind Benders')).toBeInTheDocument();
  });

  it('should load popular movies on init', async () => {
    await setup();
    expect(mockMovieService.getPopularMovies).toHaveBeenCalled();
    expect(screen.getByText('Popular Movies')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
  });

  it('should show loading state while fetching movies', async () => {
    const subject = new Subject();
    mockMovieService.getPopularMovies.mockReturnValue(subject);
    await setup();
    expect(screen.getByText('Loading movies...')).toBeInTheDocument();
  });

  it('should show error message when loading movies fails', async () => {
    mockMovieService.getPopularMovies.mockReturnValue(throwError(() => new Error('API Error')));
    await setup();
    expect(screen.getByText('Failed to load movies. Please try again later.')).toBeInTheDocument();
  });

  it('should load movies by mood when mood button is clicked', async () => {
    await setup();
    
    const feelGoodButton = screen.getByText('😊 Feel Good');
    await fireEvent.click(feelGoodButton);

    expect(mockMovieService.getMoviesByMood).toHaveBeenCalledWith('feel-good');
    expect(screen.getByText('😊 Feel Good Movies')).toBeInTheDocument();
  });

  it('should show error message when loading movies by mood fails', async () => {
    await setup();
    
    mockMovieService.getMoviesByMood.mockReturnValue(throwError(() => new Error('API Error')));
    const actionButton = screen.getByText('💥 Action Fix');
    await fireEvent.click(actionButton);

    expect(screen.getByText('Failed to load movies. Please try again later.')).toBeInTheDocument();
  });

  it('should handle watchlist changes', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { fixture } = await setup();

    // Get the first movie card component
    const movieCard = fixture.debugElement.query(sel => {
      const el = sel.nativeElement;
      return el.tagName.toLowerCase() === 'app-movie-card';
    });

    // Emit the watchlist change event
    movieCard.componentInstance.watchlistChange.emit({
      movie: mockMovies[0],
      action: 'add'
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Movie added to watchlist:',
      mockMovies[0].title
    );

    consoleSpy.mockRestore();
  });

  it('should update active mood button styles', async () => {
    await setup();
    
    const feelGoodButton = screen.getByText('😊 Feel Good');
    await fireEvent.click(feelGoodButton);

    expect(feelGoodButton).toHaveClass('active');
  });
}); 