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
  // Wait for BrowserManager's launchBrowser to complete
  await sleep(1000);
});

it('should get a pdf document representation of provided html', (done) => {
  const options = {
    htmlContent: '<html><body><h1>Sample Content</h1></body></html>',
  };

  chai.request(app)
    .post('/export/pdf')
    .send(options)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);

      expect(res.type).to.equal('application/pdf');
      expect(parseInt(res.headers['content-length'])).to.be.greaterThan(4000);
      done();
    });
});
