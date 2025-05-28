import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { SearchComponent } from './search.component';
import { MovieService } from '../../core/services/movie.service';
import { of, throwError, Subject } from 'rxjs';
import { Movie } from '../../core/models/movie.interface';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { FormsModule } from '@angular/forms';

describe('SearchComponent', () => {
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

  const mockMovieService = {
    searchMovies: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMovieService.searchMovies.mockReturnValue(of({ results: mockMovies }));
  });

  const setup = async () => {
    return render(SearchComponent, {
      componentProviders: [
        { provide: MovieService, useValue: mockMovieService }
      ],
      imports: [MovieCardComponent, FormsModule]
    });
  };

  it('should create', async () => {
    const { container } = await setup();
    expect(container).toBeTruthy();
  });

  it('should display search header and input', async () => {
    await setup();
    expect(screen.getByText('Search Movies')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for movies...')).toBeInTheDocument();
  });

  it('should show loading state while searching', async () => {
    const subject = new Subject();
    mockMovieService.searchMovies.mockReturnValue(subject);
    await setup();

    const searchInput = screen.getByPlaceholderText('Search for movies...');
    await fireEvent.input(searchInput, { target: { value: 'test' } });

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  it('should debounce search input', async () => {
    const { fixture } = await setup();
    const searchInput = screen.getByPlaceholderText('Search for movies...');

    // Type quickly
    await fireEvent.input(searchInput, { target: { value: 't' } });
    await fireEvent.input(searchInput, { target: { value: 'te' } });
    await fireEvent.input(searchInput, { target: { value: 'tes' } });
    await fireEvent.input(searchInput, { target: { value: 'test' } });

    // Wait for debounce
    await waitFor(() => {
      expect(mockMovieService.searchMovies).toHaveBeenCalledTimes(1);
      expect(mockMovieService.searchMovies).toHaveBeenCalledWith('test');
    });
  });

  it('should display search results', async () => {
    await setup();
    const searchInput = screen.getByPlaceholderText('Search for movies...');
    await fireEvent.input(searchInput, { target: { value: 'test' } });

    // Wait for debounce and results
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
  });

  it('should show no results message', async () => {
    mockMovieService.searchMovies.mockReturnValue(of({ results: [] }));
    await setup();

    const searchInput = screen.getByPlaceholderText('Search for movies...');
    await fireEvent.input(searchInput, { target: { value: 'nonexistent' } });

    // Wait for debounce and results
    await waitFor(() => {
      expect(screen.getByText('No movies found for "nonexistent"')).toBeInTheDocument();
    });
  });

  it('should handle search error', async () => {
    mockMovieService.searchMovies.mockReturnValue(throwError(() => new Error('API Error')));
    await setup();

    const searchInput = screen.getByPlaceholderText('Search for movies...');
    await fireEvent.input(searchInput, { target: { value: 'test' } });

    // Wait for debounce and error
    await waitFor(() => {
      expect(screen.getByText('Failed to search movies. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should clear results when search query is empty', fakeAsync(async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;
    const searchInput = screen.getByPlaceholderText('Search for movies...');

    // First search
    await fireEvent.input(searchInput, { target: { value: 'test' } });
    tick(300); // Wait for debounce
    fixture.detectChanges();
    
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();

    // Clear search
    await fireEvent.input(searchInput, { target: { value: '' } });
    fixture.detectChanges();
    
    expect(component.movies).toHaveLength(0);
    expect(component.loading).toBeFalsy();
    expect(component.error).toBeNull();
    expect(screen.queryByText('Test Movie 1')).not.toBeInTheDocument();
  }));

  it('should handle watchlist changes', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { fixture } = await setup();

    const searchInput = screen.getByPlaceholderText('Search for movies...');
    await fireEvent.input(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      const movieCard = fixture.debugElement.query(sel => {
        const el = sel.nativeElement;
        return el.tagName.toLowerCase() === 'app-movie-card';
      });

      // Emit watchlist change event
      movieCard.componentInstance.watchlistChange.emit({
        movie: mockMovies[0],
        action: 'add'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Movie added to watchlist:',
        mockMovies[0].title
      );
    });

    consoleSpy.mockRestore();
  });

  it('should clean up subscriptions on destroy', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
}); 