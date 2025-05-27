import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Movie } from '../models/movie.interface';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly STORAGE_KEY = 'movie_watchlist';
  private watchlistSubject: BehaviorSubject<Movie[]>;

  constructor() {
    const savedWatchlist = this.loadWatchlist();
    this.watchlistSubject = new BehaviorSubject<Movie[]>(savedWatchlist);
  }

  private loadWatchlist(): Movie[] {
    const watchlistJson = localStorage.getItem(this.STORAGE_KEY);
    return watchlistJson ? JSON.parse(watchlistJson) : [];
  }

  private saveWatchlist(movies: Movie[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(movies));
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