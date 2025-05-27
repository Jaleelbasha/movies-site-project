import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WatchlistService } from '../../../core/services/watchlist.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav">
      <div class="nav__content">
        <a routerLink="/" class="nav__logo">
          🎬 What to Watch
        </a>

        <div class="nav__links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            Home
          </a>
          <a routerLink="/search" routerLinkActive="active">
            Search
          </a>
          <a routerLink="/watchlist" routerLinkActive="active" class="nav__watchlist">
            Watchlist
            <span class="nav__watchlist-count" *ngIf="watchlistCount$ | async as count">
              {{ count }}
            </span>
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;

      &__content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &__logo {
        font-size: 1.5rem;
        font-weight: 600;
        text-decoration: none;
        color: #333;
      }

      &__links {
        display: flex;
        gap: 2rem;
        align-items: center;

        a {
          text-decoration: none;
          color: #666;
          font-weight: 500;
          transition: color 0.2s;

          &:hover {
            color: #007bff;
          }

          &.active {
            color: #007bff;
          }
        }
      }

      &__watchlist {
        position: relative;
      }

      &__watchlist-count {
        position: absolute;
        top: -8px;
        right: -12px;
        background: #dc3545;
        color: white;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        min-width: 20px;
        text-align: center;
      }
    }

    @media (max-width: 768px) {
      .nav {
        &__content {
          padding: 1rem;
        }

        &__logo {
          font-size: 1.25rem;
        }

        &__links {
          gap: 1rem;
        }
      }
    }
  `]
})
export class NavComponent implements OnInit {
  watchlistCount$!: Observable<number>;

  constructor(private watchlistService: WatchlistService) {}

  ngOnInit(): void {
    this.watchlistCount$ = this.watchlistService.getWatchlist().pipe(
      map(movies => movies.length)
    );
  }
} 