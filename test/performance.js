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

it('should get a performance response', (done) => {
  const options = {
    htmlContent: '<html><body><h1>Sample Content</h1></body></html>',
    imageType: 'png',
  };

  chai.request(app)
    .post('/performance')
    .send(options)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res.type).to.equal('application/json');
      console.log(res.body["connectStart"]);
      expect(res.body).to.be.an('object');
      expect(res.body.navigation).to.be.an('array');
      expect(res.body.resource).to.be.an('array');
      done();
    });
});

