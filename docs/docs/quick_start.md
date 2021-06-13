---
sidebar_position: 2
title: Quick Start
---

Run the development server:

```shell
npm install
npm run start
```

Dreamcatcher will listen at `http://localhost:8080` for API requests.

Send a *POST* request to `http://localhost:8080/export/pdf` or `http://localhost:8080/export/image`
depending on the desired output.

Provide either a `url`, or some raw `htmlContent`.

For example, a small snippet converted to a PNG image:

```shell
curl -X POST -H "Content-Type: application/json" \
  -d '{"htmlContent": "<html><body><h1>Sample Content</h1></body></html>"}' \
   --output output.png \
  http://localhost:8080/export/image
```

And Google.com in PDF form:

```shell
curl -X POST -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}' \
   --output output.pdf \
  http://localhost:8080/export/pdf
```
