const { defaultsDeep, merge, isNull, mapValues, pick } = require("lodash");

const defaultOptions = {
  headers: {},
  pdfOptions: {
    landscape: true,
    printBackground: true
  },
  waitFor: [],
  waitTimeout: 60000,
  imageType: "png",
  imageQuality: 90,
  scaleFactor: 2,
};

const prepareOptions = reqBody => {
  const body = mapValues(reqBody, val => (isNull(val) ? undefined : val));
  const options = defaultsDeep(body, defaultOptions);
  return options;
};

const wait = async (page, options) => {
  for (let i = 0; i < options.waitFor.length; i++) {
    const condition = options.waitFor[i];

    // Uses either waitForTimeout or waitForSelector because options.waitFor[i]
    // could only either be a String selector OR Integer time in milliseconds
    if(parseInt(condition)){
      await page.waitForTimeout(parseInt(condition));
    }else{
      await page.waitForSelector(condition, { timeout: options.waitTimeout });
    }
  }
};

const prepareContent = async (page, options) => {
  const waitUntil = options.waitForIdle ? "networkidle0" : "load";
  const gotoOptions = { timeout: options.waitTimeout, waitUntil };

  if (options.htmlContent) {
    await page.setContent(options.htmlContent, gotoOptions);
  } else {
    console.log(`[${new Date().toISOString()}] Navigating to ${options.url}`);

    await page.goto(options.url, gotoOptions);
  }

  await wait(page, options);
};

const calculateDimensions = async (page, options) => {
  const selector = options.viewportSelector || options.selector || "body";

  /* istanbul ignore next */
  const dimensions = await page.$$eval(
    `${selector}, ${selector} *`,
    elements => {
      return elements.map(el => {
        return ({
        width: el.offsetWidth,
        height: el.offsetHeight
        })
      });
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
    calculatedDimensions = await calculateDimensions(page, options);
    dimensions = {
      width: options.width || calculatedDimensions.width,
      height: options.height || calculatedDimensions.height,
    }
  }

  Object.assign(dimensions, { deviceScaleFactor: options.scaleFactor });

  return await page.setViewport(dimensions);
};

const captureImage = async (page, options) => {
  console.log(`[${new Date().toISOString()}] Starting Image capture of ${options.htmlContent ? 'provided HTML' : options.url}`);

  await setViewport(page, options);

  // save users that don't RTFM from themselves
  // puppeteer requires `jpeg` instead of `jpg`
  if (options.imageType == "jpg"){
    options.imageType = "jpeg";
  };

  let imageOptions = {
    clip: options.clipArea,
    type: options.imageType,
  };

  let jpgOptions = {
    quality: options.imageQuality
  };

  let nonSelectorOptions = {
    fullPage: !(options.width && options.height)
  };

  if (options.imageType == "jpeg"){
    imageOptions = merge(imageOptions, jpgOptions);
  }

  if (options.selector) {
    const element = await page.$(options.selector);

    if (!options.clipArea) {
      imageOptions.clip = await element.boundingBox();
    }

    return await element.screenshot(imageOptions);
  }

  imageOptions = merge(imageOptions, nonSelectorOptions);
  return await page.screenshot(imageOptions);
};

const capturePdf = async (page, options) => {
  console.log(`[${new Date().toISOString()}] Starting PDF capture: ${options.url}`);
  await setViewport(page, options);
  if(options.emulateMediaType) {
    await page.emulateMediaType(options.emulateMediaType);
  }
  return await page.pdf({ ...options.pdfOptions });
};

const handleError = (error, res) => {
  console.error(error.stack);
  res.status(500);
  res.send(error.message);
};

const isPrivateNetwork = input =>
  input.match(/(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)|(^169\.254\.)/);

module.exports = {
  prepareOptions,
  prepareContent,
  capturePdf,
  captureImage,
  handleError,
  isPrivateNetwork,
};
