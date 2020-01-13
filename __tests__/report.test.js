const { expect } = require('chai');
const axios = require('axios');

describe('PUT /reviews/report/:review_id', () => {
  let putResponse;
  let isReported = true;
  before(
    () =>
      new Promise((resolve, reject) => {
        axios.put('http://localhost:3000/reviews/report/1').then(res => {
          putResponse = res;
          axios
            .get('http://localhost:3000/reviews/1/list?count=100')
            .then(res => {
              for (let review of res.data.results) {
                if (review.review_id === 1) isReported = false;
              }
              resolve();
            });
        });
      })
  );

  it('should respond to PUT requests', () => {
    expect(putResponse.status).to.equal(204);
  });
  it('should report reviews', () => {
    expect(isReported).to.equal(true);
  });
});
