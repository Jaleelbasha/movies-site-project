import { ComponentFixture } from '@angular/core/testing';
import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { MovieDetailsComponent } from './movie-details.component';
import { MovieService } from '../../core/services/movie.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('MovieDetailsComponent', () => {
  const mockMovieDetails = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    poster_path: '/test-poster.jpg',
    backdrop_path: '/test-backdrop.jpg',
    release_date: '2024-01-01',
    vote_average: 7.5,
    runtime: 120,
    tagline: 'Test Tagline',
    genres: [
      { id: 1, name: 'Action' },
      { id: 2, name: 'Adventure' }
    ],
    credits: {
      cast: [
        {
          id: 1,
          name: 'Actor 1',
          character: 'Character 1',
          profile_path: '/actor1.jpg',
          order: 0
        },
        {
          id: 2,
          name: 'Actor 2',
          character: 'Character 2',
          profile_path: '/actor2.jpg',
          order: 1
        }
      ]
    },
    videos: {
      results: [
        {
          id: 'abc123',
          key: 'abc123',
          name: 'Official Trailer',
          site: 'YouTube',
          type: 'Trailer'
        }
      ]
    }
  };

  const mockSimilarMovies = {
    results: [
      {
        id: 2,
        title: 'Similar Movie 1',
        poster_path: '/similar1.jpg',
        release_date: '2024-02-01'
      }
    ]
  };

  const mockMovieService = {
    getMovieDetails: jest.fn(),
    getSimilarMovies: jest.fn()
  };

  const mockWatchlistService = {
    isInWatchlist: jest.fn(),
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn()
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => '1'
      }
    }
  };

  const mockSanitizer = {
    bypassSecurityTrustResourceUrl: jest.fn(url => url),
    bypassSecurityTrustStyle: jest.fn(style => style)
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockMovieService.getMovieDetails.mockReturnValue(of(mockMovieDetails));
    mockMovieService.getSimilarMovies.mockReturnValue(of(mockSimilarMovies));
    mockWatchlistService.isInWatchlist.mockReturnValue(false);
  });

  const setup = async () => {
    return render(MovieDetailsComponent, {
      imports: [CommonModule],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: WatchlistService, useValue: mockWatchlistService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DomSanitizer, useValue: mockSanitizer }
      ]
    });
  };

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display movie details', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('Test Overview')).toBeInTheDocument();
    });
  });

  it('should display movie metadata', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/120 minutes/)).toBeInTheDocument();
      expect(screen.getByText(/7.5\/10/)).toBeInTheDocument();
    });
  });

  it('should display movie genres', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Adventure')).toBeInTheDocument();
    });
  });

  it('should display movie tagline', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByText('Test Tagline')).toBeInTheDocument();
    });
  });

  it('should display cast members', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByText('Actor 1')).toBeInTheDocument();
      expect(screen.getByText('Character 1')).toBeInTheDocument();
    });
  });

  it('should display similar movies', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByText('Similar Movies')).toBeInTheDocument();
      expect(screen.getByText('Similar Movie 1')).toBeInTheDocument();
    });
  });

  it('should handle watchlist toggle when movie is not in watchlist', async () => {
    mockWatchlistService.isInWatchlist.mockReturnValue(false);
    await setup();
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add to Watchlist/i });
      expect(addButton).toBeInTheDocument();
    });
    const addButton = screen.getByRole('button', { name: /Add to Watchlist/i });
    await fireEvent.click(addButton);
    expect(mockWatchlistService.addToWatchlist).toHaveBeenCalledWith(mockMovieDetails);
  });

  it('should handle watchlist toggle when movie is in watchlist', async () => {
    mockWatchlistService.isInWatchlist.mockReturnValue(true);
    await setup();
    await waitFor(() => {
      const removeButton = screen.getByRole('button', { name: /Remove from Watchlist/i });
      expect(removeButton).toBeInTheDocument();
    });
    const removeButton = screen.getByRole('button', { name: /Remove from Watchlist/i });
    await fireEvent.click(removeButton);
    expect(mockWatchlistService.removeFromWatchlist).toHaveBeenCalledWith(mockMovieDetails.id);
  });

  it('should show loading state while fetching movie details', async () => {
    mockMovieService.getMovieDetails.mockReturnValue(new Promise(() => {}));
    await setup();
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('should generate correct backdrop URL', async () => {
    await setup();
    await waitFor(() => {
      expect(mockSanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith(
        'background-image: url("https://image.tmdb.org/t/p/original/test-backdrop.jpg")'
      );
    });
  });

  it('should generate correct poster URL', async () => {
    await setup();
    await waitFor(() => {
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        'https://image.tmdb.org/t/p/w500/test-poster.jpg'
      );
    });
  });

  it('should use fallback image when poster path is empty', async () => {
    const movieWithoutPoster = { ...mockMovieDetails, poster_path: null };
    mockMovieService.getMovieDetails.mockReturnValue(of(movieWithoutPoster));
    await setup();
    await waitFor(() => {
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('/assets/images/no-poster.jpg');
    });
  });

  it('should use fallback image when profile path is empty', async () => {
    const movieWithoutProfile = {
      ...mockMovieDetails,
      credits: {
        cast: [{ ...mockMovieDetails.credits.cast[0], profile_path: null }]
      }
    };
    mockMovieService.getMovieDetails.mockReturnValue(of(movieWithoutProfile));
    await setup();
    await waitFor(() => {
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('/assets/images/no-profile.jpg');
    });
  });

  it('should handle image error events', async () => {
    const { fixture } = await setup();
    const posterImg = screen.getByAltText('Test Movie');
    await fireEvent.error(posterImg);
    expect(posterImg.getAttribute('src')).toBe('/assets/images/no-poster.jpg');
  });

  it('should handle profile image error events', async () => {
    const { fixture } = await setup();
    const profileImg = screen.getByAltText('Actor 1');
    await fireEvent.error(profileImg);
    expect(profileImg.getAttribute('src')).toBe('/assets/images/no-profile.jpg');
  });

  it('should set trailer URL when video is available', async () => {
    await setup();
    await waitFor(() => {
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        'https://www.youtube.com/embed/abc123'
      );
    });
  });

  it('should not display trailer section when no video is available', async () => {
    const movieWithoutTrailer = {
      ...mockMovieDetails,
      videos: { results: [] }
    };
    mockMovieService.getMovieDetails.mockReturnValue(of(movieWithoutTrailer));
    await setup();
    await waitFor(() => {
      expect(screen.queryByText('Trailer')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error message when loading movie details fails', async () => {
      mockMovieService.getMovieDetails.mockReturnValue(throwError(() => new Error('API Error')));
      await setup();
      await waitFor(() => {
        expect(screen.getByText(/Failed to load movie details/)).toBeInTheDocument();
      });
    });

    it('should show error message when loading similar movies fails', async () => {
      mockMovieService.getMovieDetails.mockReturnValue(of(mockMovieDetails));
      mockMovieService.getSimilarMovies.mockReturnValue(throwError(() => new Error('API Error')));
      await setup();
      await waitFor(() => {
        expect(screen.getByText(/Failed to load similar movies/)).toBeInTheDocument();
      });
    });

    it('should handle network timeout gracefully', async () => {
      mockMovieService.getMovieDetails.mockReturnValue(throwError(() => new Error('Timeout')));
      await setup();
      await waitFor(() => {
        expect(screen.getByText(/Failed to load movie details/)).toBeInTheDocument();
      });
    });
  });
}); 