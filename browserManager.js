const puppeteer = require("puppeteer");

class BrowserManager {
  constructor() {
    this.requestCount = 0;
    this.activePrimaryRequests = {};
    this.isRotating = false;
  }

  async setup() {
    this.primaryBrowser = await this.launchBrowser();
    this.primaryBrowser.on("disconnected", () => this.handleDisconnect());
    this.secondaryBrowser = await this.launchBrowser();
  }

  getBrowser() {
    if (this.isRotating) return this.secondaryBrowser;
    return this.primaryBrowser;
  }

  rotate() {
    console.log("Browser rotation started");
    this.isRotating = true;
    this.waitForActiveRequestsAndClose(this.primaryBrowser);
  }

  logRequestStart(uuid) {
    if (!this.isRotating) this.activePrimaryRequests[uuid] = true;
  }

  logRequestEnd(uuid) {
    delete this.activePrimaryRequests[uuid];
    this.requestCount += 1;

    const requestLimit = process.env.BROWSER_REGEN_INTERVAL || 100;
    if (this.requestCount === requestLimit) {
      this.requestCount = 0;
      this.rotate();
    }
  }

  async launchBrowser() {
    return await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    });
  }

  async handleDisconnect() {
    this.primaryBrowser = this.secondaryBrowser;
    this.isRotating = false;
    this.primaryBrowser.on("disconnected", () => this.handleDisconnect());
    this.secondaryBrowser = await this.launchBrowser();
    console.log("Browser rotation completed");
  }

  waitForActiveRequestsAndClose(browser) {
    const close = async () => {
      const requestCount = Object.keys(this.activePrimaryRequests).length;
      if (requestCount === 0) return await browser.close();
      setTimeout(close, 1000);
    };
    close();
  }
}

module.exports = BrowserManager;
