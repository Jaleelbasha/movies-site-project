import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MovieService } from './movie.service';
import { environment } from '../../../environments/environment';
import { MovieResponse, MovieDetails } from '../models/movie.interface';
import { HttpErrorResponse } from '@angular/common/http';

describe('MovieService', () => {
  let service: MovieService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.tmdbApiUrl;
  const apiKey = environment.tmdbApiKey;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MovieService]
    });
    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPopularMovies', () => {
    it('should fetch popular movies with default page', () => {
      const mockResponse: MovieResponse = {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0
      };

      service.getPopularMovies().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/movie/popular?api_key=${apiKey}&page=1`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch popular movies with specified page', () => {
      const page = 2;
      service.getPopularMovies(page).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/movie/popular?api_key=${apiKey}&page=${page}`
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getMoviesByMood', () => {
    it('should fetch feel-good movies', () => {
      service.getMoviesByMood('feel-good').subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/discover/movie?api_key=${apiKey}&with_genres=35,10751&page=1`
      );
      expect(req.request.method).toBe('GET');
    });

    it('should fetch action movies', () => {
      service.getMoviesByMood('action-fix').subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/discover/movie?api_key=${apiKey}&with_genres=28,12&page=1`
      );
      expect(req.request.method).toBe('GET');
    });

    it('should fetch mind-bender movies', () => {
      service.getMoviesByMood('mind-benders').subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/discover/movie?api_key=${apiKey}&with_genres=9648,53&page=1`
      );
      expect(req.request.method).toBe('GET');
    });

    it('should fetch movies by mood with specified page', () => {
      const page = 3;
      service.getMoviesByMood('feel-good', page).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/discover/movie?api_key=${apiKey}&with_genres=35,10751&page=${page}`
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('searchMovies', () => {
    it('should search movies with query', () => {
      const query = 'test movie';
      service.searchMovies(query).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/search/movie?api_key=${apiKey}&query=${query}&page=1`
      );
      expect(req.request.method).toBe('GET');
    });

    it('should search movies with query and specified page', () => {
      const query = 'test movie';
      const page = 2;
      service.searchMovies(query, page).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/search/movie?api_key=${apiKey}&query=${query}&page=${page}`
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getMovieDetails', () => {
    it('should fetch movie details by id', () => {
      const movieId = 123;
      const mockDetails: MovieDetails = {
        id: movieId,
        title: 'Test Movie',
        overview: 'Test Overview',
        poster_path: '/test.jpg',
        backdrop_path: '/test-backdrop.jpg',
        release_date: '2024-01-01',
        vote_average: 7.5,
        vote_count: 1000,
        genre_ids: [28, 12],
        runtime: 120,
        status: 'Released',
        tagline: 'Test Tagline',
        genres: [],
        videos: { results: [] },
        credits: { cast: [], crew: [] }
      };

      service.getMovieDetails(movieId).subscribe(response => {
        expect(response).toEqual(mockDetails);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/movie/${movieId}?api_key=${apiKey}&append_to_response=videos,credits`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });
  });

  describe('getSimilarMovies', () => {
    it('should fetch similar movies by id', () => {
      const movieId = 123;
      service.getSimilarMovies(movieId).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/movie/${movieId}/similar?api_key=${apiKey}`
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network error when fetching popular movies', async () => {
      const errorPromise = new Promise((resolve) => {
        service.getPopularMovies().subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(0);
            expect(error.statusText).toBe('Unknown Error');
            resolve(undefined);
          }
        });

        const req = httpMock.expectOne(`${apiUrl}/movie/popular?api_key=${apiKey}&page=1`);
        req.error(new ErrorEvent('Network Error'));
      });

      await errorPromise;
    });

    it('should handle timeout when fetching movies by mood', async () => {
      const errorPromise = new Promise((resolve) => {
        service.getMoviesByMood('feel-good').subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(0);
            expect(error.statusText).toBe('Unknown Error');
            resolve(undefined);
          }
        });

        const req = httpMock.expectOne(
          `${apiUrl}/discover/movie?api_key=${apiKey}&with_genres=35,10751&page=1`
        );
        req.error(new ErrorEvent('Timeout'));
      });

      await errorPromise;
    });

    it('should handle server error when searching movies', (done) => {
      service.searchMovies('test').subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${apiUrl}/search/movie?api_key=${apiKey}&query=test&page=1`
      );
      req.flush('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error'
      });
    });

    it('should handle API key error when fetching movie details', (done) => {
      service.getMovieDetails(1).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${apiUrl}/movie/1?api_key=${apiKey}&append_to_response=videos,credits`
      );
      req.flush('Invalid API key', {
        status: 401,
        statusText: 'Unauthorized'
      });
    });

    it('should handle rate limit error when fetching similar movies', (done) => {
      service.getSimilarMovies(1).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(429);
          expect(error.statusText).toBe('Too Many Requests');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${apiUrl}/movie/1/similar?api_key=${apiKey}`
      );
      req.flush('Rate limit exceeded', {
        status: 429,
        statusText: 'Too Many Requests'
      });
    });
  });
}); 