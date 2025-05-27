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

Production URL: [https://movies-site-project.vercel.app](https://movies-site-project.vercel.app)

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
