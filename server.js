var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');
var Nightmare = require('nightmare');
var fs = require('fs');
var crypto = require('crypto');
var async = require('async');

var app = express();

var pdfDefaults = {
  marginsType: 0,
  landscape: true,
  printBackground: true,
  pageSize: "Letter",
  printSelectionOnly: false
};

var responseHeaderDefaults = function(fileName){
  return {
    'Content-Disposition': 'attachment',
    'Transfer-Encoding': 'binary'
  };
}

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(allowCrossDomain);

function generateDownloadData(opts, nightmare, callback) {
  var dataGenerationChain = nightmare
    .viewport(opts.width, opts.height)
    .goto(opts.url, opts.headers)
    .wait("body")
    .evaluate(function () {
      document.querySelector('body').style.overflow = 'hidden';
    });

  if(opts.waitOptions && opts.waitOptions.length > 0){
    _.each(opts.waitOptions, function(waitForItem){
      waitVal = parseInt(waitForItem) ? parseInt(waitForItem) : waitForItem;
      dataGenerationChain = dataGenerationChain.wait(waitVal);
    });
  }

  if (opts.boundingRect) {
    dataGenerationChain.scrollTo(opts.boundingRect.top, opts.boundingRect.left);
  }

  if(opts.type === "pdf"){
    dataGenerationChain = dataGenerationChain.pdf(undefined, opts.pdfOptions);
  } else {
    dataGenerationChain = dataGenerationChain.screenshot(undefined, opts.pngClipArea);
  }
  dataGenerationChain.run(callback).end();
}

function prepareContentForDownload(opts, callback){
  if(opts.htmlContent){
    var htmlContentFilePath = "/tmp/" + md5(opts.htmlContent) + ".html";
    fs.writeFile(htmlContentFilePath, opts.htmlContent, 'utf8', function(){
      opts.url = "file://" + htmlContentFilePath;
      opts.localFileName = htmlContentFilePath;
      callback && callback();
    })

  }else{
    callback && callback();
  }
}

function findElementSizeAndDownload (downloadOptions, nightmare, responseCallback) {
  var selector = downloadOptions.selector || "body";
  nightmare
    .goto(downloadOptions.url, downloadOptions.headers)
    .wait("body")
    .evaluate(function (selector) {
      document.querySelector('body').style.overflow = 'hidden';
      return {
        width: document.querySelector(selector).offsetWidth,
        height: document.querySelector(selector).offsetHeight,
        boundingRect: {
          top: document.querySelector(selector).getBoundingClientRect().top,
          left: document.querySelector(selector).getBoundingClientRect().left
        }
      };
    }, selector)
    .then(function (dimensions) {
      generateDownloadData(_.extend(downloadOptions, dimensions), nightmare, responseCallback)
    })
}

function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

function handlePdf (req, res, queueCallback) {
  var nightmare = new Nightmare({ frame: false, useContentSize: true });

  var pdfOptions = _.extend(pdfDefaults, req.body.pdfOptions);

  var downloadOptions = {
    type: "pdf",
    url: req.body.url,
    width: req.body.width,
    height: req.body.height,
    selector: req.body.selector,
    pdfOptions: pdfOptions,
    waitOptions: req.body.waitFor,
    headers: req.body.headers,
    htmlContent: req.body.htmlContent
  };

  var responseCallback = function (err, fileData) {
    if (downloadOptions.localFileName) {
      console.log(downloadOptions.localFileName);
      fs.unlink(downloadOptions.localFileName);
    }
    var payload = err || fileData;
    if (!err) {
      var headers = _.extend(responseHeaderDefaults, { 'Content-Type': 'application/pdf' });
      res.set(headers);
    }
    res.send(payload);
    queueCallback();
  };

  prepareContentForDownload(downloadOptions, function () {
    generateDownloadData(downloadOptions, nightmare, responseCallback);
  });
};

function handlePng (req, res, queueCallback) {
  var nightmare = new Nightmare({ frame: false, useContentSize: true });

  var downloadOptions = {
    type: "png",
    url: req.body.url,
    width: req.body.width,
    height: req.body.height,
    selector: req.body.selector,
    waitOptions: req.body.waitFor,
    pngClipArea: req.body.clipArea,
    headers: req.body.headers,
    htmlContent: req.body.htmlContent
  };

  var responseCallback = function (err, fileData) {
    if (downloadOptions.localFileName) {
      console.log(downloadOptions.localFileName);
      fs.unlink(downloadOptions.localFileName);
    }
    var payload = err || fileData;
    if (!err) {
      var headers = _.extend(responseHeaderDefaults, { 'Content-Type': 'image/png' });
      res.set(headers);
    }
    res.send(payload);
    queueCallback();
  };

  prepareContentForDownload(downloadOptions, function () {
    if (req.body.width && req.body.height) {
      generateDownloadData(downloadOptions, nightmare, responseCallback);
    } else {
      findElementSizeAndDownload(downloadOptions, nightmare, responseCallback);
    }
  });
}

var queue = async.queue(function (task, callback) {
  if (task.type === 'pdf') {
    handlePdf(task.req, task.res, callback);
  } else {
    handlePng(task.req, task.res, callback);
  }
}, 2)


app.get("/status", function(req,res){
  res.type("text/plain");
  res.status(200).send("I like Kit-Kat, unless I'm with four or more people.");
});

app.post("/export/pdf", function(req, res) {
  queue.push({ req, res, type: 'pdf' });
});

app.post("/export/png", function(req, res) {
  queue.push({ req, res, type: 'png' });
});

var server = app.listen(8181, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Dreamcatcher microservice listening at http://%s:%s', host, port);
});
