const { defaultsDeep, isNull, mapValues, pick } = require("lodash");
const { eachSeries } = require("async");

const defaultOptions = {
  headers: {},
  pdfOptions: {
    landscape: true,
    printBackground: true
  },
  waitFor: [],
  waitTimeout: 30000
};

const prepareOptions = reqBody => {
  const body = mapValues(reqBody, val => (isNull(val) ? undefined : val));
  const options = defaultsDeep(body, defaultOptions);
  return options;
};

const wait = async (page, options) => {
  for (let i = 0; i < options.waitFor.length; i++) {
    const condition = options.waitFor[i];
    const value = parseInt(condition) || condition;
    await page.waitFor(value, { timeout: options.waitTimeout });
  }
};

const prepareContent = async (page, options) => {
  const waitUntil = options.waitForIdle ? "networkidle0" : "load";
  const gotoOptions = { timeout: options.waitTimeout, waitUntil };

  if (options.htmlContent) {
    await page.setContent(options.htmlContent, gotoOptions);
  } else {
    await page.goto(options.url, gotoOptions);
  }

  await wait(page, options);
};

const calculateDimensions = async (page, options) => {
  const selector = options.selector || "body";

  const dimensions = await page.$$eval(
    `${selector}, ${selector} *`,
    elements => {
      return elements.map(el => ({
        width: el.offsetWidth,
        height: el.offsetHeight
      }));
    }
  );

  const widths = dimensions
    .map(el => el.width)
    .filter(num => Number.isInteger(num));
  const heights = dimensions
    .map(el => el.height)
    .filter(num => Number.isInteger(num));
  const width = Math.max(...widths);
  const height = Math.max(...heights);

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error(
      "Source was successfully loaded but no visible elements were rendered"
    );
  }

  return { width, height };
};

const setViewport = async (page, options) => {
  let dimensions;
  if (options.width && options.height) {
    dimensions = pick(options, ["width", "height"]);
  } else {
    dimensions = await calculateDimensions(page, options);
  }

  Object.assign(dimensions, { deviceScaleFactor: 2 });
  return await page.setViewport(dimensions);
};

const capturePng = async (page, options) => {
  await setViewport(page, options);

  if (options.selector) {
    const element = await page.$(options.selector);
    return await element.screenshot({ clip: options.clipArea });
  }

  return await page.screenshot({
    clip: options.clipArea,
    fullPage: !(options.width && options.height)
  });
};

const capturePdf = async (page, options) => {
  await setViewport(page, options);
  return await page.pdf({ ...options.pdfOptions });
};

const handleError = (error, res) => {
  console.error(error.stack);
  res.status(500);
  res.send(error.message);
};

module.exports = {
  prepareOptions,
  prepareContent,
  capturePdf,
  capturePng,
  handleError
};
