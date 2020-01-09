const chakram = require('chakram'),
  expect = chakram.expect;

describe('GET /reviews/:product_id/meta', () => {
  let response;
  before(() =>
    new Promise((resolve, reject) => {
      chakram
        .get('http://localhost:3000/reviews/5/meta')
        .then(data => resolve(data))
        .catch(err => reject(err));
    }).then(data => (response = data))
  );

  it('should handle GET requests', () => {
    expect(response).to.have.status(200);
    expect(response).to.not.have.header('non-existing-header');
  }).timeout(9000);
  it('should have a product id', () => {
    expect(response.body.product_id).to.be.a('string');
  });
  it('should have a ratings summary', () => {
    expect(response.body).to.have.property('ratings');
    expect(response.body.ratings).to.eql({
      4: 1,
      3: 1
    });
  });
  it('should have a characteristics summary', () => {
    expect(response.body).to.have.property('characteristics');
    expect(response.body.characteristics).to.eql({
      Size: {
        id: 14,
        value: '4.0000'
      },
      Width: {
        id: 15,
        value: '3.5000'
      },
      Comfort: {
        id: 16,
        value: '4.0000'
      },
      Quality: {
        id: 17,
        value: '3.5000'
      }
    });
  });
  it('should have a recommended summary', () => {
    expect(response.body).to.have.property('recommended');
    expect(response.body.recommended).to.eql({ 1: 2 });
  });
});
