const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const onFinished = require("on-finished");
const async = require("async");
const Sentry = require("@sentry/node");
const uuid = require("uuid/v1");
const BrowserManager = require("./browserManager");
const {
  prepareOptions,
  prepareContent,
  capturePdf,
  capturePng,
  handleError
} = require("./helpers");

const useSentry = !!process.env.SENTRY_DSN;
if (useSentry) Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();
const browserManager = new BrowserManager();
browserManager.setup();

const allowCrossDomain = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};

if (useSentry) app.use(Sentry.Handlers.requestHandler());
app.use(logger("dev"));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(allowCrossDomain);
if (useSentry) app.use(Sentry.Handlers.errorHandler());

const responseHeaderDefaults = {
  "Content-Disposition": "attachment",
  "Transfer-Encoding": "binary"
};

const processRequest = async (task, queueCallback) => {
  let page;
  try {
    const requestId = uuid();
    browserManager.logRequestStart(requestId);
    onFinished(task.res, () => browserManager.logRequestEnd(requestId));

    const options = prepareOptions(task.req.body);

    page = await browserManager.getBrowser().newPage();
    await page.setExtraHTTPHeaders(options.headers);

    await prepareContent(page, options);

    let payload;
    if (task.type == "pdf") {
      payload = await capturePdf(page, options);
      task.res.type("application/pdf");
    } else {
      payload = await capturePng(page, options);
      task.res.type("image/png");
    }

    task.res.set(responseHeaderDefaults);
    task.res.send(payload);
  } catch (e) {
    if (useSentry) Sentry.captureException(e);
    handleError(e, task.res, Sentry);
  } finally {
    if (page) page.close();
    queueCallback();
  }
};

const numWorkers = process.env.CONCURRENCY || 20;
const queue = async.queue(
  (task, callback) => processRequest(task, callback),
  numWorkers
);

app.get("/status", function(req, res) {
  res.type("text/plain");
  res.status(200).send("Dreamcatcher is running.");
});

app.post("/export/pdf", (req, res) => {
  queue.push({ req, res, type: "pdf" });
});

app.post("/export/png", (req, res) => {
  queue.push({ req, res, type: "png" });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Dreamcatcher listening at http://%s:%s", host, port);
});
