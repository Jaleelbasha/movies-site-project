import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav">
      <div class="nav__left">
        <a routerLink="/" class="nav__logo">Movies</a>
      </div>
      <div class="nav__right">
        <a 
          routerLink="/watchlist" 
          class="nav__watchlist"
          routerLinkActive="active"
        >
          Watchlist ({{ watchlistCount }})
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: #1a1a1a;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .nav__logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: #fff;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #007bff;
      }
    }

    .nav__watchlist {
      color: #fff;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        background: #007bff;
        color: #fff;

        &:hover {
          background: #0056b3;
        }
      }
    }
  `]
})
export class NavComponent implements OnInit, OnDestroy {
  watchlistCount = 0;
  private subscription: Subscription | null = null;

  constructor(private watchlistService: WatchlistService) {}

  ngOnInit(): void {
    // Initial count
    this.updateWatchlistCount();

    // Subscribe to watchlist changes
    this.subscription = this.watchlistService.getWatchlist().pipe(
      tap(movies => {
        this.watchlistCount = movies.length;
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateWatchlistCount(): void {
    this.watchlistService.getWatchlist().subscribe(movies => {
      this.watchlistCount = movies.length;
    });
  }
}