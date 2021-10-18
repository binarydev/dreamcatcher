---
sidebar_position: 2
title: export
id: export
---

## `POST /export/image`
## `POST /export/pdf`

**Returns:** Binary data

**Parameters (JSON):** All fields are optional except that one of `url` and `htmlContent` is required.

- **url:** STRING - Target URL to capture.
- **htmlContent:** STRING - HTML to render directly and capture. If this field is present, any value of `url` will be ignored.
- **headers:** OBJECT (Default: `{}`) - Headers to include in the request to the host specified in `url` (e.g. for authentication).
- **width:** INTEGER (Default: `800`) - Width of browser viewport. If `width`, `height`, and `selector` are all omitted, Dreamcatcher will attempt to capture the entire target page, regardless of the default viewport.
- **height:** INTEGER (Default: `600`) - Height of browser viewport.
- **selector:** STRING (Default: `body`) -  CSS selector defining the portion of the page to capture. If a `selector` is specified, it will be captured in its entirety regardless of the viewport dimensions specified in `width` and `height`.
- **viewportSelector:** STRING - CSS selector defining the element of the page used to set the viewport dimensions. Use this when the viewport should be set to a different element than the selector and either `width` or `height` are not set.
- **waitFor:** ARRAY[String selector OR Integer time in milliseconds] (Default: `[]`) - Array of conditions to wait for before capturing a representation. Conditions will be evaluated sequentially.
- **waitTimeout:** INTEGER (Default: `30000`) - Maximum number of milliseconds to wait for succesful navigation and for any conditions specified in `waitFor` (non-cumulative) before returning an error response.
- **waitForIdle:** BOOLEAN (Default: `false`) - Whether to consider navigation successful only once all network connections have been closed for at least 500 ms, rather than once the browser's `load` event has been fired. Useful for capturing single-page applications where the load event may not be a reliable indicator of page readiness.
- **imageType:** STRING (Default: `png`; Image only) - The type of image you would like to export. Available options are `jpeg`, `png`, `webp`.
- **imageQuality:** INTEGER (Default: `100`; Image with type of `jpeg` only) - Available range is 0-100. Only applies when requesting a `jpeg` image.
- **scaleFactor:** INTEGER (Default: `2`) - the device scaling factor for images. By default Dreamcatcher generates images with scale factor 2, suitable for retina / high DPI displays.
- **emulateMediaType:** ?STRING (Default: `undefined`) - if this is set, it will be passed to Puppeteer before printing. Valid values: `screen`, `print`.
- **clipArea:** OBJECT (Default: `{}`; Image only) - Capture a cropped region of the page:
  - **x:** INTEGER
  - **y:** INTEGER
  - **width:** INTEGER (Optional)
  - **height:** INTEGER (Optional)
- **pdfOptions:** OBJECT (Default: `{landscape: true, printBackground: true}`; PDF only) - Options to pass to Puppeteer's [pdf function](https://pptr.dev/#?product=Puppeteer&version=v10.4.0&show=api-pagepdfoptions).
