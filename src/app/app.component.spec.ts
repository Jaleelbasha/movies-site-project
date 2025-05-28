import { render, screen } from '@testing-library/angular';
import { AppComponent } from './app.component';
import { NavComponent } from './shared/components/nav/nav.component';
import { RouterTestingModule } from '@angular/router/testing';
import { WatchlistService } from './core/services/watchlist.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  const mockWatchlistService = {
    getWatchlist: jest.fn().mockReturnValue(of([]))
  };

  const setup = async () => {
    return render(AppComponent, {
      imports: [RouterTestingModule],
      declarations: [],
      componentProviders: [
        { provide: WatchlistService, useValue: mockWatchlistService }
      ],
      componentImports: [NavComponent]
    });
  };

  it('should create', async () => {
    const { container } = await setup();
    expect(container).toBeTruthy();
  });

  it('should render navigation component', async () => {
    await setup();
    expect(document.querySelector('app-nav')).toBeTruthy();
  });

  it('should render router outlet', async () => {
    await setup();
    expect(document.querySelector('router-outlet')).toBeTruthy();
  });

  it('should have main content area', async () => {
    await setup();
    const main = document.querySelector('main');
    expect(main).toBeTruthy();
  });

  it('should apply correct styles', async () => {
    const { container } = await setup();
    const hostElement = container.firstElementChild;
    const main = document.querySelector('main');

    const hostStyles = window.getComputedStyle(hostElement!);
    const mainStyles = window.getComputedStyle(main!);

    expect(hostStyles.display).toBe('block');
    expect(hostStyles.minHeight).toBe('100vh');
    expect(hostStyles.background).toBe('rgb(248, 249, 250)');
    expect(mainStyles.minHeight).toBe('calc(100vh - 64px)');
  });

  it('should maintain layout structure', async () => {
    await setup();
    const nav = document.querySelector('app-nav');
    const main = document.querySelector('main');
    const router = document.querySelector('router-outlet');

    // Check DOM structure
    expect(nav?.nextElementSibling).toBe(main);
    expect(main?.querySelector('router-outlet')).toBe(router);
  });
});
