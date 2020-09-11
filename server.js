const express = require("express");
const logger = require("morgan");
const Url = require("url");
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
  captureImage,
  handleError,
  isPrivateNetwork,
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
app.use(logger('[:date[iso]] :remote-addr ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', {
  skip: (req, res) => req.path === '/status'
}));
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

    if(process.env.ALLOW_PRIVATE_NETWORKS !== 'true') {
      await page.setRequestInterception(true);
      page.on('request', interceptedRequest => {
        const url = interceptedRequest.url();
        const hostname = Url.parse(url).hostname;
        if (isPrivateNetwork(hostname)) {
          console.log(`Warning: Aborting request to ${url}`);
          interceptedRequest.abort();
        } else {
          interceptedRequest.continue();
        }
      });
    }

    await page.setExtraHTTPHeaders(options.headers);

    await prepareContent(page, options);

    let payload;
    if (task.type == "pdf") {
      payload = await capturePdf(page, options);
      task.res.type("application/pdf");
    } else {
      payload = await captureImage(page, options);
      if (options.imageType == "png"){
        task.res.type("image/png");
      } else {
        task.res.type("image/jpeg");
      }
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

app.post("/export/image", (req, res) => {
  queue.push({ req, res, type: "image" });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Dreamcatcher listening at http://%s:%s", host, port);
});
