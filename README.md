# What Should I Watch Tonight - Movie Discovery Web App

A responsive Angular-based movie discovery application that helps users explore, search, and view details about movies using the TMDB (The Movie Database) API.

## Features

- 🎬 Landing page with mood-based movie suggestions
- 🔍 Advanced search functionality for movies and actors
- 📱 Responsive design for all devices
- 🎯 Detailed movie information pages
- 📺 Movie trailers integration
- 📝 Personal watchlist functionality
- ✨ Clean and intuitive user interface

## Tech Stack

- **Frontend Framework:** Angular
- **Styling:** SCSS with BEM methodology
- **Testing:** Jest + Angular Testing Library
- **State Management:** NgRx
- **API Integration:** TMDB API
- **CI/CD:** GitHub Actions

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (latest)
- TMDB API Key (Must login for getting api key)
- VPN is mandatory to access TMDB site

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Jaleelbasha/movies-site-project.git
   cd movies-site-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Add your TMDB API key into environment file:
     ```
     TMDB_API_KEY=your_api_key_here
     ```

4. Start the development server:
   ```bash
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── core/              # Singleton services, interfaces, and models
│   ├── features/          # Feature modules (movies, search, watchlist)
│   ├── shared/           # Shared components, directives, and pipes
│   └── utils/            # Helper functions and utilities
├── assets/
│   └── styles/          # Global styles and variables
├── environments/        # Environment configurations
└── tests/              # Test setup and configurations
```

## Development Guidelines

### Code Style

- Follow Angular style guide
- Use TypeScript strict mode
- Implement SOLID principles
- Write comprehensive documentation
- Include unit tests for all components

### Git Workflow

1. Create feature branch from `main`
2. Make atomic commits with clear messages
3. Write tests for new features
4. Create pull request for review
5. Merge after approval

### Testing

Run tests:
```bash
npm run test
```

Generate coverage report:
```bash
npm run test:coverage
```

## Deployment

The application is automatically deployed using GitHub Actions when changes are pushed to the `main` branch.

Production URL: https://jaleelbasha.github.io/movies-site-project/

## API Documentation

This project uses the TMDB API. For detailed API documentation, visit:
[TMDB API Documentation](https://developers.themoviedb.org/3)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Movie Details Component Test Coverage

## Test Coverage Summary
- Total Tests: 104
- Passed: 80
- Failed: 24
- Test Suites: 9 total (4 passed, 5 failed)

## Test Categories

### 1. Component Initialization
- ✅ Component creation
- ❌ Basic movie details display
- ❌ Movie metadata display (release date, runtime, rating)

### 2. Data Display Tests
- ❌ Movie genres display
- ❌ Movie tagline display
- ❌ Cast members display
- ❌ Similar movies display
- ✅ Loading state display
- ✅ Error state display

### 3. URL and Image Handling
- ❌ Backdrop URL generation and display
- ❌ Poster URL generation and display
- ❌ Profile image URL handling
- ❌ Trailer URL handling
- ✅ Fallback image handling for missing posters
- ✅ Fallback image handling for missing profiles

### 4. User Interaction
- ❌ Watchlist toggle when movie is not in watchlist
- ❌ Watchlist toggle when movie is in watchlist
- ✅ Image error handling
- ✅ Profile image error handling

### 5. Error Handling
- ✅ Movie details loading failure
- ✅ Similar movies loading failure
- ✅ Network timeout handling
- ✅ Invalid data handling

## Main Issues Identified

1. URL Sanitization Issues:
   - Multiple failures with `NG0904: unsafe value used in a resource URL context`
   - Problems with `bypassSecurityTrustUrl` vs `bypassSecurityTrustResourceUrl`
   - Issues with backdrop, poster, and trailer URL sanitization

2. Mock Service Problems:
   - `getMovieDetails` not returning proper Observable
   - Issues with mock data structure
   - Service response handling

3. Component Lifecycle:
   - Initialization sequence issues
   - Data loading and error handling
   - State management during loading

## Test Implementation Details

### Mock Data
```typescript
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
        profile_path: '/actor1.jpg'
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
```

### Test Setup
```typescript
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
```

## Next Steps for Improvement

1. URL Sanitization:
   - Properly implement `DomSanitizer` methods
   - Use correct sanitization method for each URL type
   - Add comprehensive URL validation

2. Mock Service:
   - Improve mock service implementation
   - Add proper Observable handling
   - Enhance error simulation

3. Test Coverage:
   - Add more edge cases
   - Improve async test handling
   - Add integration tests

4. Component Improvements:
   - Enhance error handling
   - Improve loading states
   - Add input validation

5. Documentation:
   - Add JSDoc comments
   - Document test cases
   - Add setup instructions
