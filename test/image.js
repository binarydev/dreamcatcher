// const sinon = require('sinon');
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../server.js');

const expect = chai.expect;

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

before( async() => {
  // Wait for browser to launch
  await sleep(1000);
});

it('should get a png image representation of provided html', (done) => {
  const options = {
    htmlContent: '<html><body><h1>Sample Content</h1></body></html>',
    imageType: 'png',
  };

  chai.request(app)
    .post('/export/image')
    .send(options)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res.type).to.equal('image/png');
      expect(res.body.length).to.be.greaterThan(10000);
      done();
    });
});


it('should get a jpeg image representation of provided html', (done) => {
  const options = {
    htmlContent: '<html><body><h1>Sample Content</h1></body></html>',
    imageType: 'jpeg',
  };

  chai.request(app)
    .post('/export/image')
    .send(options)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res.type).to.equal('image/jpeg');
      expect(res.body.length).to.be.greaterThan(10000);
      done();
    });
});


it('should get a webp image representation of provided html', (done) => {
  const options = {
    htmlContent: '<html><body><h1>Sample Content</h1></body></html>',
    imageType: 'webp',
  };

  chai.request(app)
    .post('/export/image')
    .send(options)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res.type).to.equal('image/webp');
      expect(res.body.length).to.be.greaterThan(5000);
      done();
    });
});
