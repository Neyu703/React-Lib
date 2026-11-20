import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
// Leaf files, not testing/index.js: tests that vi.mock a module must be the first to load it.
import { installDomStubs } from "../testing/domStubs.js";
import { resetReactLib } from "../testing/reset.js";

installDomStubs();

afterEach(() => {
  cleanup();
  resetReactLib();
});
