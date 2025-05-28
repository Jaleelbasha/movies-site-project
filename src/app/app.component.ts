import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavComponent],
  template: `
    <div class="app">
      <app-nav></app-nav>
      <main class="app__main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app__main {
      flex: 1;
      min-height: calc(100vh - 64px);
      padding-top: 1rem;
    }
  `]
})
export class AppComponent {}
