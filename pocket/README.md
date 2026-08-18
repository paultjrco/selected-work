# Pocket Portfolio

Pocket Portfolio is a lightweight, mobile-first presentation format for showing a small body of work in person and handing it off as a digital business card.

It is intended to live independently from the job-application-oriented Selected Work portfolio. The current wireframe uses `paultjrco.github.io` as its proposed public destination; publishing infrastructure will be decided after the presentation is approved.

This initial wireframe contains the `spaces` edition for PAULTJRCO. Content lives in `editions.js`; the renderer and interaction model are shared so future editions can target UX/product design or other audiences without rebuilding the presentation.

The presentation keeps its published image assets in the local `images/` directory. This makes the `/pocket/` deployment self-contained and prevents changes to it from affecting the existing Selected Work portfolio.

## Preview

From the repository root, run:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/presentations/pocket-portfolio/?edition=spaces
```

Swipe or scroll vertically between screens. Swipe horizontally within project screens, or use the arrow buttons, to change gallery frames.

## Prototype status

- The first real-photo galleries are in place for interaction and image-selection review.
- The final handoff screen includes a scannable QR code for the published Pocket Portfolio URL.
- A scoped service worker caches the complete presentation after its first successful online load. Reopen it once before an event to confirm offline availability on the presentation device.
- Additional editions should be added as sibling entries in `editions.js`.

## Image focal points

An image frame can use plain-language focal directions such as `"left"`, `"left bottom"`, `"bottom center"`, or `"top right"`. The browser prioritizes that region when `object-fit: cover` crops an image for different screen proportions. The optional word `focal` and commas are ignored, so feedback such as “focal left, bottom” can be entered directly. Exact percentage pairs such as `"42% 30%"` remain available for unusually precise crops.
