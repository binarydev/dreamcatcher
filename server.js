const express = require("express");
const logger = require("morgan");
const Url = require("url");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const Sentry = require("@sentry/node");
const { Cluster } = require('puppeteer-cluster');
const {
  log,
  prepareOptions,
  handleError,
  prepareContent,
  measureContent,
  capturePdf,
  captureImage,
  isPrivateNetwork,
} = require("./helpers");

const useSentry = !!process.env.SENTRY_DSN;
if (useSentry) Sentry.init({ dsn: process.env.SENTRY_DSN });

const commonSetup = async (page, options) => {
  if (process.env.ALLOW_PRIVATE_NETWORKS !== 'true') {
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
      const url = interceptedRequest.url();
      const hostname = Url.parse(url).hostname;
      if (isPrivateNetwork(hostname)) {
        log(`Warning: Aborting request to ${url}`);
        interceptedRequest.abort();
      } else {
        interceptedRequest.continue();
      }
    });
  }

  await page.setExtraHTTPHeaders(options.headers);
};

const screenshotTask = async ({ page, data: {options, format}}) => {
  await commonSetup(page, options);
  await prepareContent(page, options);

  if (format === 'pdf') {
    return await capturePdf(page, options);
  } else {
    return await captureImage(page, options);
  }
};

const performanceTask = async ({ page, data: {options}}) => {
  await commonSetup(page, options);
  await prepareContent(page, options, true);
  return await measureContent(page, options);
};

const allowCrossDomain = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};

const app = express();

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: process.env.CONCURRENCY ? parseInt(process.env.CONCURRENCY) : 15,
    monitor: process.env.MONITOR ? true : false,
    puppeteerOptions: {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ],
    },
  });

  if (useSentry) app.use(Sentry.Handlers.requestHandler());
  if (!process.env.MONITOR) {
    app.use(logger('[:date[iso]] :remote-addr ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', {
      skip: (req, res) => req.path === '/status'
    }));
  }
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(allowCrossDomain);
  if (useSentry) app.use(Sentry.Handlers.errorHandler());

  app.get("/status", function(req, res) {
    res.type("text/plain");
    res.status(200).send("Dreamcatcher is running.");
  });

  app.post("/export/:format", async (req, res) => {
    if (!['image', 'pdf'].includes(req.params.format)) {
      return res.status(422).send('Unsupported format');
    }

    try {
      const options = prepareOptions(req.body);
      const payload = await cluster.execute(
        {options, format: req.params.format},
        screenshotTask
      );

      if (req.params.format == 'pdf') {
        res.type('application/pdf');
      } else {
        if (options.imageType == 'png') {
          res.type("image/png");
        } else if (options.imageType == 'webp') {
          res.type('image/webp');
        } else {
          res.type('image/jpeg');
        }
      }
      res.send(payload);
    } catch (e) {
      if (useSentry) Sentry.captureException(e);
      handleError(e, res, Sentry);
    }
  });

  app.post('/performance', async (req, res) => {
    try {
      const options = prepareOptions(req.body);
      const result = await cluster.execute(
        {options, format: req.params.format},
        performanceTask
      );

      res.type("application/json");
      res.send(`{"navigation": ${result.navigation}, "resource": ${result.resource}}`);
    } catch (e) {
      if (useSentry) Sentry.captureException(e);
      handleError(e, res, Sentry);
    }
  });

})();

module.exports = app;
