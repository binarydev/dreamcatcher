// const sinon = require('sinon');
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
const app = require('../server.js');

it('should get a good status response', (done) => {
  chai.request(app)
    .get('/status')
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res.text).to.contain('Dreamcatcher is running');
      done();
    });
});