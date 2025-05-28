import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { WatchlistService } from './watchlist.service';
import { Movie } from '../models/movie.interface';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let mockLocalStorage: { [key: string]: string } = {};

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

  beforeEach(() => {
    mockLocalStorage = {};

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string): string | null => {
          return mockLocalStorage[key] || null;
        },
        setItem: (key: string, value: string): void => {
          mockLocalStorage[key] = value;
        },
        removeItem: (key: string): void => {
          delete mockLocalStorage[key];
        },
        clear: (): void => {
          mockLocalStorage = {};
        }
      },
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [
        WatchlistService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(WatchlistService);
  });

  afterEach(() => {
    mockLocalStorage = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadWatchlist', () => {
    it('should load empty watchlist when localStorage is empty', () => {
      service.getWatchlist().subscribe(watchlist => {
        expect(watchlist).toEqual([]);
      });

      expect(mockLocalStorage['movie_watchlist']).toBeUndefined();
    });

    it('should load existing watchlist from localStorage', () => {
      const savedWatchlist = [mockMovie];
      mockLocalStorage['movie_watchlist'] = JSON.stringify(savedWatchlist);

      // Create a new instance to test loading from localStorage
      service = TestBed.inject(WatchlistService);

      service.getWatchlist().subscribe(watchlist => {
        expect(watchlist).toEqual(savedWatchlist);
      });
    });
  });

  describe('addToWatchlist', () => {
    it('should add movie to empty watchlist', () => {
      service.addToWatchlist(mockMovie);

      service.getWatchlist().subscribe(watchlist => {
        expect(watchlist).toEqual([mockMovie]);
      });

      expect(JSON.parse(mockLocalStorage['movie_watchlist'])).toEqual([mockMovie]);
    });

    it('should not add duplicate movie to watchlist', () => {
      service.addToWatchlist(mockMovie);
      service.addToWatchlist(mockMovie);

      service.getWatchlist().subscribe(watchlist => {
        expect(watchlist).toEqual([mockMovie]);
      });

      expect(JSON.parse(mockLocalStorage['movie_watchlist'])).toEqual([mockMovie]);
    });
  });

  describe('removeFromWatchlist', () => {
    beforeEach(() => {
      service.addToWatchlist(mockMovie);
    });

    it('should remove movie from watchlist', () => {
      service.removeFromWatchlist(mockMovie.id);

      service.getWatchlist().subscribe(watchlist => {
        expect(watchlist).toEqual([]);
      });

      expect(JSON.parse(mockLocalStorage['movie_watchlist'])).toEqual([]);
    });

    it('should not modify watchlist when removing non-existent movie', () => {
      service.removeFromWatchlist(999);

      service.getWatchlist().subscribe(watchlist => {
        expect(watchlist).toEqual([mockMovie]);
      });

      expect(JSON.parse(mockLocalStorage['movie_watchlist'])).toEqual([mockMovie]);
    });
  });

  describe('isInWatchlist', () => {
    it('should return true for movie in watchlist', () => {
      service.addToWatchlist(mockMovie);
      expect(service.isInWatchlist(mockMovie.id)).toBe(true);
    });

    it('should return false for movie not in watchlist', () => {
      expect(service.isInWatchlist(mockMovie.id)).toBe(false);
    });
  });

  describe('clearWatchlist', () => {
    it('should remove all movies from watchlist', () => {
      service.addToWatchlist(mockMovie);
      service.addToWatchlist({ ...mockMovie, id: 2 });

      service.clearWatchlist();

      service.getWatchlist().subscribe(watchlist => {
        expect(watchlist).toEqual([]);
      });

      expect(JSON.parse(mockLocalStorage['movie_watchlist'])).toEqual([]);
    });
  });

  describe('Platform Detection', () => {
    it('should not use localStorage when not in browser', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          WatchlistService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(WatchlistService);

      serverService.addToWatchlist(mockMovie);

      // Should not modify localStorage
      expect(mockLocalStorage['movie_watchlist']).toBeUndefined();

      serverService.getWatchlist().subscribe(watchlist => {
        expect(watchlist).toEqual([mockMovie]);
      });
    });
  });
}); 