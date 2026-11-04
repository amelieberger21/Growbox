import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { entries, species } from "./catalog";
import { mushroomPhotos } from "./mushroomPhotos";

describe("Bildzuordnungen der Pilzbibliothek", () => {
  it("verwendet für alle 15 Einträge unterschiedliche Bildinhalte und passende dokumentierte Artnamen", () => {
    const hashes = entries.map(entry => {
      const photo = mushroomPhotos[entry.slug];
      expect(photo.scientificName, entry.name).toBe(species[entry.speciesId].scientificName);
      expect(photo.sourceUrl).toMatch(/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
      expect(photo.licenseUrl).toMatch(/^https:\/\//);
      expect(photo.author).toBeTruthy();
      expect(photo.reviewedAt).toBe("2026-11-04");
      const content = readFileSync(resolve(process.cwd(), "public", photo.src.slice(1)));
      expect(content.subarray(0,2).toString("hex")).toBe("ffd8");
      return createHash("sha256").update(content).digest("hex");
    });
    expect(hashes).toHaveLength(15);
    expect(new Set(hashes).size).toBe(15);
    expect(mushroomPhotos.nameko.sourceUrl).not.toBe(mushroomPhotos.goldkaeppchen.sourceUrl);
  });
});
