import { render, screen, fireEvent } from '@testing-library/angular';
import { WatchlistComponent } from './watchlist.component';
import { WatchlistService } from '../../core/services/watchlist.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Movie } from '../../core/models/movie.interface';

describe('WatchlistComponent', () => {
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

  const mockWatchlistService = {
    getWatchlist: jest.fn(),
    isInWatchlist: jest.fn(),
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWatchlistService.getWatchlist.mockReturnValue(of(mockMovies));
  });

  const setup = async () => {
    return render(WatchlistComponent, {
      componentProviders: [
        { provide: WatchlistService, useValue: mockWatchlistService }
      ],
      imports: [MovieCardComponent, RouterTestingModule]
    });
  };

  it('should create', async () => {
    const { container } = await setup();
    expect(container).toBeTruthy();
  });

  it('should display watchlist header', async () => {
    await setup();
    expect(screen.getByText('My Watchlist')).toBeInTheDocument();
  });

  it('should display number of saved movies', async () => {
    await setup();
    expect(screen.getByText('2 movies saved')).toBeInTheDocument();
  });

  it('should display movies from watchlist', async () => {
    await setup();
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
  });

  it('should display empty state when watchlist is empty', async () => {
    mockWatchlistService.getWatchlist.mockReturnValue(of([]));
    await setup();
    
    expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument();
    expect(screen.getByText('Browse Movies')).toBeInTheDocument();
  });

  it('should remove movie from list when watchlist change event is emitted', async () => {
    const { fixture } = await setup();

    // Get the first movie card
    const movieCard = fixture.debugElement.query(sel => {
      const el = sel.nativeElement;
      return el.tagName.toLowerCase() === 'app-movie-card';
    });

    // Emit remove event
    movieCard.componentInstance.watchlistChange.emit({
      movie: mockMovies[0],
      action: 'remove'
    });

    // Wait for changes to be applied
    await fixture.whenStable();
    fixture.detectChanges();

    // Check if movie was removed from the list
    expect(screen.queryByText('Test Movie 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    expect(screen.getByText('1 movies saved')).toBeInTheDocument();
  });

  it('should not modify list when add event is emitted', async () => {
    const { fixture } = await setup();

    const movieCard = fixture.debugElement.query(sel => {
      const el = sel.nativeElement;
      return el.tagName.toLowerCase() === 'app-movie-card';
    });

    // Emit add event
    movieCard.componentInstance.watchlistChange.emit({
      movie: mockMovies[0],
      action: 'add'
    });

    // List should remain unchanged
    fixture.detectChanges();
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    expect(screen.getByText('2 movies saved')).toBeInTheDocument();
  });

  it('should load watchlist on init', async () => {
    await setup();
    expect(mockWatchlistService.getWatchlist).toHaveBeenCalled();
  });

  it('should have browse button with correct route', async () => {
    mockWatchlistService.getWatchlist.mockReturnValue(of([]));
    await setup();
    
    const browseButton = screen.getByText('Browse Movies');
    expect(browseButton.getAttribute('href')).toBe('/');
  });
}); 