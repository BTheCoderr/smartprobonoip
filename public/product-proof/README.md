# Product proof media

## Official product demo

The homepage and `/pilot` pages embed the official YouTube walkthrough via
`ProductDemoVideo` (click-to-load, `youtube-nocookie.com`):

https://youtu.be/dgBbGfNxWdg

## Screenshot walkthrough

Real app captures used by `ProductWalkthrough`:

- `/product-proof/walkthrough/01-guided-intake.png`
- `/product-proof/walkthrough/02-organize-story.png`
- `/product-proof/walkthrough/03-missing-information.png`
- `/product-proof/walkthrough/04-readiness-packet.png`
- `/product-proof/walkthrough/05-professional-review.png`

Refresh with:

```bash
node scripts/capture-walkthrough.mjs
```

(Requires a temporary Playwright install.)

## Optional stills

Drop additional assets here, then set paths in `PRODUCT_PROOF_MEDIA` (`src/lib/copy.ts`):

- `/product-proof/builder.png`
- `/product-proof/snapshot.png`
- `/product-proof/search.png`
- `/product-proof/pdf.png`

Leave paths as `null` until assets exist. Do not invent partner logos or named quotes.
