var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();

var pdfDefaults = {
  landscape: true, 
  printBackground: true,
  pageSize: "Letter"
};

var defaultExportCallback = function(err,fileDataPayload) {
    if(err){
      return { type: "error", payload: err };
    }else{
      return { type: "file", payload: fileDataPayload };
    }
  };

var responseHeaderDefaults = function(fileName){
  return {
    'Content-Disposition': 'attachment; filename=' + fileName,
    'Transfer-Encoding': 'binary'
  };
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

function generateDownloadData(opts, callback){
  var Nightmare = require('nightmare');
  var dataGenerationChain = new Nightmare()
    .viewport(opts.height, opts.width)
    .goto(opts.url)
    .wait();

  if(opts.type === "pdf"){
    dataGenerationChain = dataGenerationChain.pdf(undefined, opts.pdfOptions);
  }
  else{
    dataGenerationChain = dataGenerationChain.screenshot(); 
  }

  dataGenerationChain.run(callback).end();
}

app.post("/export/pdf", function(req,res) {
  var payload, pdfOptions = _.extend( pdfDefaults , req.body.pdfOptions );

  var fileDataResponse = generateDownloadData({
      type: "pdf",
      url: req.body.url,
      width: req.body.width,
      height: req.body.height,
      pdfOptions: pdfOptions
    }, function(err,fileData) {
      var payload = err || fileData;
      if(!err){
        var headers = _.extend( responseHeaderDefaults(req.body.fileName) , { 'Content-Type': 'application/pdf' } );
        res.set(headers);
      }
      res.send(payload);
    });

});

app.post("/export/png", function(req,res) {

  var fileDataResponse = generateDownloadData({
      type: "png",
      url: req.body.url,
      width: req.body.width,
      height: req.body.height
    }, function(err,fileData) {
      var payload = err || fileData;
      if(!err){
        var headers = _.extend( responseHeaderDefaults(req.body.fileName) , { 'Content-Type': 'application/pdf' } );
        res.set(headers);
      }
      res.send(payload);
    });
});

var server = app.listen(80, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});


