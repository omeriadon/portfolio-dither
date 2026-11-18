// Builds src/fonts/BayerPixel.otf from the glyph tables in Bayer's PixelFont.swift.
// Usage: bun scripts/build-pixel-font.ts [path/to/PixelFont.swift]
//
// Each lit cell becomes a small rounded square, the same shape Bayer's PixelCells draws.
// One cell is 100 units and the em is 1000, so at font-size 10n px every cell is n px.
import { homedir } from "node:os";
import { join } from "node:path";
import opentype from "opentype.js";

const source =
  process.argv[2] ??
  join(homedir(), "Documents/Xcode_App_Library/Bayer/Bayer/UI/PixelFont.swift");
const out = join(import.meta.dir, "../src/fonts/BayerPixel.otf");

const CELL = 100;
const WIDTH = 5;
const HEIGHT = 7; // cap height in cells
const DESCENT = 2;
const ADVANCE = (WIDTH + 1) * CELL;
const INSET = CELL * 0.12; // PixelCells gap
const SIDE = CELL - INSET * 2;
const RADIUS = SIDE * 0.22;
const K = 0.5523; // circle-ish cubic handle

const swift = await Bun.file(source).text();
const glyphRows = new Map<string, string[]>();
for (const match of swift.matchAll(/^\s*"(.)": \[([^\]]*)\],/gmu)) {
  const rows = [...match[2].matchAll(/"([.#]+)"/g)].map((m) => m[1]);
  glyphRows.set(match[1], rows);
}
if (!glyphRows.has("a") || !glyphRows.has("A")) {
  throw new Error(`Couldn't find upper and lowercase glyphs in ${source}`);
}

function roundedSquare(path: opentype.Path, x: number, y: number) {
  // y is the bottom edge in font units (y up). Counter-clockwise for CFF outer contours.
  const l = x + INSET, r = x + INSET + SIDE, b = y + INSET, t = y + INSET + SIDE;
  const c = RADIUS * K;
  path.moveTo(l + RADIUS, b);
  path.lineTo(r - RADIUS, b);
  path.curveTo(r - RADIUS + c, b, r, b + RADIUS - c, r, b + RADIUS);
  path.lineTo(r, t - RADIUS);
  path.curveTo(r, t - RADIUS + c, r - RADIUS + c, t, r - RADIUS, t);
  path.lineTo(l + RADIUS, t);
  path.curveTo(l + RADIUS - c, t, l, t - RADIUS + c, l, t - RADIUS);
  path.lineTo(l, b + RADIUS);
  path.curveTo(l, b + RADIUS - c, l + RADIUS - c, b, l + RADIUS, b);
  path.close();
}

const glyphs = [
  new opentype.Glyph({ name: ".notdef", unicode: 0, advanceWidth: ADVANCE, path: new opentype.Path() }),
];
for (const [char, rows] of glyphRows) {
  const path = new opentype.Path();
  rows.forEach((row, rowIndex) => {
    // Row 0 is the top of the cap height; rows 7 and 8 hang below the baseline.
    const y = (HEIGHT - 1 - rowIndex) * CELL;
    [...row].forEach((cell, column) => {
      if (cell === "#") roundedSquare(path, column * CELL, y);
    });
  });
  const code = char.codePointAt(0)!;
  glyphs.push(
    new opentype.Glyph({ name: `u${code.toString(16).toUpperCase().padStart(4, "0")}`, unicode: code, advanceWidth: ADVANCE, path }),
  );
}

const font = new opentype.Font({
  familyName: "Bayer Pixel",
  styleName: "Regular",
  unitsPerEm: 1000,
  ascender: (HEIGHT + 1) * CELL,
  descender: -DESCENT * CELL,
  glyphs,
});
await Bun.write(out, new Uint8Array(font.toArrayBuffer()));
console.log(`wrote ${out} (${glyphs.length - 1} glyphs)`);
