import { render, screen, fireEvent } from '@testing-library/angular';
import { MovieCardComponent } from './movie-card.component';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { RouterModule } from '@angular/router';
import { Movie } from '../../../core/models/movie.interface';
import { environment } from '../../../../environments/environment';
import { RouterTestingModule } from '@angular/router/testing';

describe('MovieCardComponent', () => {
  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    poster_path: '/test.jpg',
    backdrop_path: '/test-backdrop.jpg',
    release_date: '2024-01-01',
    vote_average: 7.5,
    vote_count: 1000,
    genre_ids: [28, 12]
  };

  const mockWatchlistService = {
    isInWatchlist: jest.fn(),
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = async (movie = mockMovie) => {
    return render(MovieCardComponent, {
      componentProperties: {
        movie
      },
      componentProviders: [
        { provide: WatchlistService, useValue: mockWatchlistService }
      ],
      imports: [RouterTestingModule]
    });
  };

  it('should create', async () => {
    const { container } = await setup();
    expect(container).toBeTruthy();
  });

  it('should display movie title', async () => {
    await setup();
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  it('should display movie year', async () => {
    await setup();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('should display movie rating', async () => {
    await setup();
    expect(screen.getByText('⭐ 7.5')).toBeInTheDocument();
  });

  it('should display N/A for missing release date', async () => {
    const movieWithoutDate = { ...mockMovie, release_date: '' };
    await setup(movieWithoutDate);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should generate correct image URL', async () => {
    await setup();
    const image = screen.getByAltText('Test Movie') as HTMLImageElement;
    expect(image.src).toBe(`${environment.tmdbImageUrl}/w500/test.jpg`);
  });

  it('should use fallback image when poster path is empty', async () => {
    const movieWithoutPoster = { ...mockMovie, poster_path: '' };
    await setup(movieWithoutPoster);
    const image = screen.getByAltText('Test Movie') as HTMLImageElement;
    expect(image.src).toContain('assets/images/no-poster.jpg');
  });

  it('should use fallback image when image fails to load', async () => {
    await setup();
    const image = screen.getByAltText('Test Movie') as HTMLImageElement;
    fireEvent.error(image);
    expect(image.src).toContain('assets/images/no-poster.jpg');
  });

  it('should show filled heart when movie is in watchlist', async () => {
    mockWatchlistService.isInWatchlist.mockReturnValue(true);
    await setup();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('should show empty heart when movie is not in watchlist', async () => {
    mockWatchlistService.isInWatchlist.mockReturnValue(false);
    await setup();
    expect(screen.getByText('🤍')).toBeInTheDocument();
  });

  it('should add movie to watchlist when clicking empty heart', async () => {
    mockWatchlistService.isInWatchlist.mockReturnValue(false);
    const { fixture } = await setup();

    const watchlistSpy = jest.spyOn(fixture.componentInstance.watchlistChange, 'emit');
    const heartButton = screen.getByText('🤍');
    await fireEvent.click(heartButton);

    expect(mockWatchlistService.addToWatchlist).toHaveBeenCalledWith(mockMovie);
    expect(watchlistSpy).toHaveBeenCalledWith({
      movie: mockMovie,
      action: 'add'
    });
  });

  it('should remove movie from watchlist when clicking filled heart', async () => {
    mockWatchlistService.isInWatchlist.mockReturnValue(true);
    const { fixture } = await setup();

    const watchlistSpy = jest.spyOn(fixture.componentInstance.watchlistChange, 'emit');
    const heartButton = screen.getByText('❤️');
    await fireEvent.click(heartButton);

    expect(mockWatchlistService.removeFromWatchlist).toHaveBeenCalledWith(mockMovie.id);
    expect(watchlistSpy).toHaveBeenCalledWith({
      movie: mockMovie,
      action: 'remove'
    });
  });

  it('should have a details button with correct route', async () => {
    await setup();
    const detailsButton = screen.getByText('Details');
    expect(detailsButton.getAttribute('ng-reflect-router-link')).toBe('/movie,1');
  });

  it('should apply active class to watchlist button when movie is in watchlist', async () => {
    mockWatchlistService.isInWatchlist.mockReturnValue(true);
    await setup();
    const heartButton = screen.getByText('❤️');
    expect(heartButton).toHaveClass('movie-card__button--active');
  });
}); 