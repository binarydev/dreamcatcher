---
sidebar_position: 1
title: performance
id: performance
---

## `POST /performance`

**Parameters (JSON):**

- **url:** string - Target URL to capture.
- **htmlContent:** string - HTML to render directly and capture. If this field is present, any value of `url` will be ignored.

**Return value**

This method returns an object with two properties:

 * `navigation` contains all the information provided by the browser's
   [Navigation Timing](https://www.w3.org/TR/navigation-timing-2/) entries ―
   `performance.getEntriesByType("navigation"))`
 * `resource` contains all the information provided by the browser's
   [Resource Timing](https://www.w3.org/TR/resource-timing-2/) entries ―
   `performance.getEntriesByType("resource"))`

For more information, see the [Navigation and Resource Timing guide](https://developers.google.com/web/fundamentals/performance/navigation-and-resource-timing/).

Note ― when passing `htmlContent` to evaluate, because of the way that puppeteer sets the content, it is possible that neither
of these performance entries will have any data. Therefore it is recommended to use this feature with a `url`.
