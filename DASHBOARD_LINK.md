# PropertyMax Dashboard Link

After the standalone flyer generator is published, place a green **Print Property Flyer** button on `propertymax.ai/app` that opens the published app in the same tab. The generator intentionally starts with one building selector so a manager can choose their community and create the corresponding flyer immediately.

```html
<a
  href="https://YOUR-PUBLISHED-FLYER-GENERATOR-URL"
  class="propertymax-flyer-button"
>
  Print Property Flyer
</a>
```

Use the final published site address in place of `https://YOUR-PUBLISHED-FLYER-GENERATOR-URL`. No property ID, regional assignment, authentication handoff, or dashboard data integration is required for the current standalone version.

| Manager action | Result |
|---|---|
| Selects a building | The preview loads that building’s approved photo and name. |
| Changes the referral amount | The reward wording updates immediately on the flyer. |
| Chooses a local image | The selected image replaces the preview photo for the current browser session. |
| Selects Print Flyer | The browser’s standard print dialog opens, where the manager can print or save as PDF. |
| Selects Download PNG | A high-resolution PNG file downloads for email and digital sharing. |
