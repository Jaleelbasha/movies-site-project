import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { MovieDetailsComponent } from './features/movie-details/movie-details.component';
import { SearchComponent } from './features/search/search.component';
import { WatchlistComponent } from './features/watchlist/watchlist.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'movie/:id',
    component: MovieDetailsComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: 'watchlist',
    component: WatchlistComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
