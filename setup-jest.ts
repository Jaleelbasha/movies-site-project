/// <reference types="jest" />
import 'zone.js';
import 'zone.js/testing';
import '@testing-library/jest-dom';

const ZONE_FAKE_ASYNC_TEST = 'Zone.FakeAsyncTest';

// @ts-ignore
window.__Zone_enable_cross_context_check = true;

const getTestBed = async () => {
  return (await import('@angular/core/testing')).TestBed;
};

beforeEach(async () => {
  const testBed = await getTestBed();
  testBed.resetTestEnvironment();
  testBed.initTestEnvironment(
    (await import('@angular/platform-browser-dynamic/testing')).BrowserDynamicTestingModule,
    (await import('@angular/platform-browser-dynamic/testing')).platformBrowserDynamicTesting(),
  );
});

// Mock localStorage
const localStorageMock: Storage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 