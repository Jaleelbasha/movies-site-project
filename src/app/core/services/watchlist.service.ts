import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Movie } from '../models/movie.interface';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly STORAGE_KEY = 'movie_watchlist';
  private watchlistSubject: BehaviorSubject<Movie[]>;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    const savedWatchlist = this.loadWatchlist();
    this.watchlistSubject = new BehaviorSubject<Movie[]>(savedWatchlist);
  }

  private loadWatchlist(): Movie[] {
    if (this.isBrowser) {
      const watchlistJson = localStorage.getItem(this.STORAGE_KEY);
      return watchlistJson ? JSON.parse(watchlistJson) : [];
    }
    return [];
  }

  private saveWatchlist(movies: Movie[]): void {
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(movies));
    }
    this.watchlistSubject.next(movies);
  }

  getWatchlist(): Observable<Movie[]> {
    return this.watchlistSubject.asObservable();
  }

  addToWatchlist(movie: Movie): void {
    const currentWatchlist = this.watchlistSubject.value;
    if (!currentWatchlist.some(m => m.id === movie.id)) {
      this.saveWatchlist([...currentWatchlist, movie]);
    }
  }

  removeFromWatchlist(movieId: number): void {
    const currentWatchlist = this.watchlistSubject.value;
    const updatedWatchlist = currentWatchlist.filter(movie => movie.id !== movieId);
    this.saveWatchlist(updatedWatchlist);
  }

  isInWatchlist(movieId: number): boolean {
    return this.watchlistSubject.value.some(movie => movie.id === movieId);
  }

  clearWatchlist(): void {
    this.saveWatchlist([]);
  }
} 