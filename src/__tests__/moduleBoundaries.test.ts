import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..");
const MODULES = join(SRC, "modules");

const sourcesOf = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? sourcesOf(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
  });

const importsOf = (file: string): string[] =>
  [...readFileSync(file, "utf8").matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].map(
    (match) => match[1] as string,
  );

describe("module boundaries", () => {
  it("lets a module reach another module only through its index", () => {
    const violations: string[] = [];
    for (const file of sourcesOf(MODULES)) {
      const own = relative(MODULES, file).split(sep)[0];
      for (const target of importsOf(file).filter((spec) => spec.startsWith("."))) {
        const resolved = relative(MODULES, join(file, "..", target)).split(sep);
        if (resolved[0] === "..") continue; // leaves modules/ (core, shared components)
        if (resolved[0] !== own && !(resolved.length === 2 && resolved[1] === "index.js"))
          violations.push(`${relative(SRC, file)} -> ${target}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps core and the shared components free of module internals", () => {
    const violations: string[] = [];
    const files = readdirSync(SRC)
      .filter((name) => /\.(ts|tsx)$/.test(name))
      .map((name) => join(SRC, name))
      .concat(sourcesOf(join(SRC, "core")));
    for (const file of files) {
      for (const target of importsOf(file).filter((spec) => spec.includes("modules/"))) {
        if (!/modules\/\w+\/index\.js$/.test(target)) violations.push(`${relative(SRC, file)} -> ${target}`);
      }
    }
    expect(violations).toEqual([]);
  });
});
