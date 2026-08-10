Wooden blinds catalog (web-optimized PDF + pre-rendered flipbook images).
Source/full-res backup (if any): public/_pdf-originals/

Recompress (pure JS, rasterizes pages — no Ghostscript needed). This both
recompresses the downloadable PDF AND regenerates the static JPEGs +
manifest.json under public/catalog/<name>/ used by the web flipbook viewer:
  npm run compress:catalog-pdf -- wooden-blinds 90 62
  (args: <name-without-ext> <dpi> <jpeg-quality>)

The flipbook viewer (CatalogFlipbookModal) loads /catalog/<id>/manifest.json
+ page-NNN.jpg directly when present — no PDF parsing in the browser, so it
opens near-instantly and pages are cached by the browser. If a catalog has
no manifest yet, it falls back to rendering the PDF client-side (slower).

Recompress (Ghostscript, keeps vector text, PDF only — no flipbook images):
  npm run compress:pdfs
