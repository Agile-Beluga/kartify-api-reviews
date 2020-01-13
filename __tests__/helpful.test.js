const { expect } = require('chai');
const axios = require('axios');

describe('PUT /reviews/helpful/:review_id', () => {
  let putResponse, newHelpfulness, oldHelpfulness;
  before(
    () =>
      new Promise((resolve, reject) => {
        axios
          .get('http://localhost:3000/reviews/1/list?count=100')
          .then(res => {
            oldHelpfulness =
              res.data.results[res.data.results.length - 1].helpfulness;
            axios
              .put('http://localhost:3000/reviews/helpful/1')
              .then(res => {
                putResponse = res;
                axios
                  .get('http://localhost:3000/reviews/1/list?count=100')
                  .then(res => {
                    newHelpfulness =
                      res.data.results[res.data.results.length - 1].helpfulness;
                    resolve();
                  });
              })
              .catch(err => console.error(err));
          });
      })
  );

  it('should respond to PUT requests', () => {
    expect(putResponse.status).to.equal(204);
  });
  it('should fetch review with incremented helpfulness', () => {
    expect(newHelpfulness).to.equal(oldHelpfulness + 1);
  });
});
