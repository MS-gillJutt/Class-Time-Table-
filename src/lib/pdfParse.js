// PDF import entry point (lazy-loaded by Admin).
// extractPages uses pdf.js; pure grid-parsing logic lives in parseGrid.js
// (kept import-free so it can be unit-tested in Node).
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export { parseTimetable, toRows, fromRows } from './parseGrid';

/** Extract positioned text items per page (with fontName for bold detection). */
export async function extractPages(file, onProgress) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const pages = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const items = tc.items
      .filter((it) => it.str && it.str.trim())
      .map((it) => ({
        str: it.str.trim(),
        x: it.transform[4],
        y: it.transform[5], // PDF coords: y grows upward
        w: it.width || 0,
        font: it.fontName || '',
      }));
    const vp = page.getViewport({ scale: 1 });
    pages.push({ page: p, items, height: vp.height, width: vp.width });
    onProgress && onProgress(p / pdf.numPages);
  }
  return pages;
}
