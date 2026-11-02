import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
window.scrollTo = vi.fn();
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};

import { initialExperience, EXPERIENCE_KEY } from "./experience/model";
import { createInitialState } from "./simulation/engine";
import i18n from "./i18n";
beforeEach(() => {
  const experience = initialExperience(createInitialState());
  experience.preferences.welcomeAnswered = true;
  localStorage.setItem(EXPERIENCE_KEY, JSON.stringify(experience));
  void i18n.changeLanguage("de");
  document.documentElement.dir = "ltr";
  document.documentElement.dataset.easy = "false";
});
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
HTMLElement.prototype.scrollIntoView = vi.fn();
