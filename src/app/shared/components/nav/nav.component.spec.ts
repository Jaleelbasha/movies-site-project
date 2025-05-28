import { ComponentFixture } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { NavComponent } from './nav.component';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Movie } from '../../../core/models/movie.interface';

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
  getWatchlist: jest.fn().mockReturnValue(of(mockMovies))
};

describe('NavComponent', () => {
  const setup = async () => {
    return render(NavComponent, {
      imports: [RouterTestingModule],
      providers: [
        { provide: WatchlistService, useValue: mockWatchlistService }
      ]
    });
  };

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display logo', async () => {
    await setup();
    const logo = screen.getByText('Movies');
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('href')).toBe('/');
  });

  it('should display watchlist link', async () => {
    await setup();
    const watchlistLink = screen.getByText(/Watchlist/);
    expect(watchlistLink).toBeInTheDocument();
    expect(watchlistLink.closest('a')?.getAttribute('href')).toBe('/watchlist');
  });

  it('should display watchlist count', async () => {
    await setup();
    expect(screen.getByText(/Watchlist \(2\)/)).toBeInTheDocument();
  });

  it('should not display watchlist count when empty', async () => {
    mockWatchlistService.getWatchlist.mockReturnValueOnce(of([]));
    await setup();
    expect(screen.getByText(/Watchlist \(0\)/)).toBeInTheDocument();
  });

  it('should update watchlist count when movies change', async () => {
    const { rerender } = await setup();
    expect(screen.getByText(/Watchlist \(2\)/)).toBeInTheDocument();

    mockWatchlistService.getWatchlist.mockReturnValue(of([mockMovies[0]]));
    await rerender();

    expect(screen.getByText(/Watchlist \(1\)/)).toBeInTheDocument();
  });

  it('should load watchlist count on init', async () => {
    await setup();
    expect(mockWatchlistService.getWatchlist).toHaveBeenCalled();
    expect(screen.getByText(/Watchlist \(2\)/)).toBeInTheDocument();
  });
}); 