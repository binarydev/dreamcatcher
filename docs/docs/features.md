---
sidebar_position: 1
title: Features
---

Dreamcatcher is a node.js project that provides a lightweight API for generating
Image and PDF representations of a web page. MIT licensed.

 * Simple HTTP API.
 * The source can be a provided as an HTML snippet or a URL.
 * The image output can be JPEG, PNG or WebP images. You can specify the JPEG image quality.
 * The PDF output can be customized per Puppeteer's options.
 * The scale can be set to 2&times; (for HiDPI) or to 1&times; (normal).
 * You can request the whole page or part of it, based on a provided selector.
 * You can wait for a certain time to pass, for a selector to appear, or both.
 * Additional API endpoint that provides the browser's
   [Navigation and Resource Timing metrics](https://developers.google.com/web/fundamentals/performance/navigation-and-resource-timing/).
 * Blocks by default access to private network resources.
 * Integration with Sentry for error reporting.

# Credits

Dreamcatcher is built on the shoulders of giants:

 * [Puppeteer](https://pptr.dev/)
 * [Puppeteer Cluster](https://github.com/thomasdondorf/puppeteer-cluster) by
  [Thomas Dondorf](https://github.com/thomasdondorf)

