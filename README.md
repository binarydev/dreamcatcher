Node-based service providing a lightweight API for generating JPEG/PNG and PDF representations of a web page, using headless Chrome and [Puppeteer](https://pptr.dev/).

# Installation and Use

## Docker

Clone this repository, `docker build . -t dreamcatcher`, and `docker run dreamcatcher`.

To install additional fonts in the built image, place them in a top-level `fonts` directory in this repo before building.

## Standalone

To run without Docker, simply `npm install && npm start`. Requires Node `8.12.0` (LTS) or newer.

## Environment Variables

The following optional environment variables are available for configuration:

- **CONCURRENCY:** (Default: `20`) The maximum number of requests to process concurrently. Requests over the limit will be added to a queue. Decrease this if you experience performance problems during peak load.
- **BROWSER_REGEN_INTERVAL:** (Default: `100`) To maximize performance, requests share a common browser instance (running in effect as separate tabs). However, to avoid the impact of memory leaks in Chromium, the shared browser is refreshed after the number of requests specified here. Try lowering this if you notice cyclical performance degradation.
- **PORT:** (Default: `8080`) The port on which the Dreamcatcher server will run. Only relevant for non-Docker installs; with Docker, simply map 8080 to the desired outward-facing port.
- **SENTRY_DSN:** (Default: `undefined`) Dreamcatcher can integrate with Sentry for error reporting. To use Sentry, provide the DSN identifying your Sentry project and host.

**Troubleshooting Tips**
- When testing Dreamcatcher locally using Docker and a locally-served target site, be sure to use your machine's external-facing IP address in the `url` parameter (rather than `localhost`).
- Don't be alarmed if your generated image files are twice as large as the requested dimensions. Dreamcatcher sets the `deviceScaleFactor` property of the Chromium viewport to `2`, so as to generate images suitable for high-resolution "retina" displays.

# API

### `GET /status`

**Returns:** Status code `200 OK`

### `POST /export/image`
### `POST /export/pdf`

**Returns:** Binary data

**Parameters (JSON):** All fields are optional except one of `url` and `htmlContent` is required.

- **url:** STRING - Target URL to capture.
- **htmlContent:** STRING - HTML to render directly and capture. If this field is present, any value of `url` will be ignored.
- **headers:** OBJECT (Default: `{}`) - Headers to include in the request to the host specified in `url` (e.g. for authentication).
- **width:** INTEGER (Default: `800`) - Width of browser viewport. If `width`, `height`, and `selector` are all omitted, Dreamcatcher will attempt to capture the entire target page, regardless of the default viewport.
- **height:** INTEGER (Default: `600`) - Height of browser viewport.
- **selector:** STRING (Default: `body`) -  CSS selector defining the portion of the page to capture. If a `selector` is specified, it will be captured in its entirety regardless of the viewport dimensions specified in `width` and `height`.
- **waitFor:** ARRAY[String selector OR Integer time in milliseconds] (Default: `[]`) - Array of conditions to wait for before capturing a representation. Conditions will be evaluated sequentially.
- **waitTimeout:** INTEGER (Default: `30000`) - Maximum number of milliseconds to wait for succesful navigation and for any conditions specified in `waitFor` (non-cumulative) before returning an error response.
- **waitForIdle:** BOOLEAN (Default: `false`) - Whether to consider navigation successful only once all network connections have been closed for at least 500 ms, rather than once the browser's `load` event has been fired. Useful for capturing single-page applications where the load event may not be a reliable indicator of page readiness.
- **imageType:** STRING (Default: `png`; Image only) - The type of image you would like to export. Available options are `jpeg` and `png`.
- **imageQuality:** INTEGER (Default: `100`; Image with type of `jpeg` only) - Available range is 0-100. Only applies when requesting a `jpeg` image.
- **clipArea:** OBJECT (Default: `{}`; Image only) - Capture a cropped region of the page:
  - **x:** INTEGER
  - **y:** INTEGER
  - **width:** INTEGER (Optional)
  - **height:** INTEGER (Optional)
- **pdfOptions:** OBJECT (Default: `{landscape: true, printBackground: true}`; PDF only) - Options to pass to Puppeteer's [pdf function](https://pptr.dev/#?product=Puppeteer&version=v1.9.0&show=api-pagepdfoptions).
