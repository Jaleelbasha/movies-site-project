import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieDetails, MovieResponse } from '../models/movie.interface';

type MoodGenres = {
  'feel-good': string;
  'action-fix': string;
  'mind-benders': string;
};

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = environment.tmdbApiUrl;
  private apiKey = environment.tmdbApiKey;

  constructor(private http: HttpClient) {}

  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.apiUrl}/movie/popular?api_key=${this.apiKey}&page=${page}`
    );
  }

  getMoviesByMood(mood: keyof MoodGenres, page: number = 1): Observable<MovieResponse> {
    const moodGenres: MoodGenres = {
      'feel-good': '35,10751', // Comedy, Family
      'action-fix': '28,12', // Action, Adventure
      'mind-benders': '9648,53' // Mystery, Thriller
    };

    return this.http.get<MovieResponse>(
      `${this.apiUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${moodGenres[mood]}&page=${page}`
    );
  }

  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.apiUrl}/search/movie?api_key=${this.apiKey}&query=${query}&page=${page}`
    );
  }

  getMovieDetails(id: number): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(
      `${this.apiUrl}/movie/${id}?api_key=${this.apiKey}&append_to_response=videos,credits`
    );
  }

  getSimilarMovies(id: number): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.apiUrl}/movie/${id}/similar?api_key=${this.apiKey}`
    );
  }
} 