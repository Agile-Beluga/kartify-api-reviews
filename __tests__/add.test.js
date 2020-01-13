const { expect } = require('chai');
const axios = require('axios');

describe('POST /reviews/:product_id', () => {
  let postResponse, review;
  before(
    () =>
      new Promise((resolve, reject) => {
        axios
          .post('http://localhost:3000/reviews/1', {
            rating: 5,
            summary: 'A very rad product!!',
            body:
              'This product was very good but also very radical. I appreciate the symmetry.',
            recommended: true,
            name: 'ian',
            email: 'email@exampledomain.com',
            photos: ['https://unsplash.com/photos/TQxUc5q8paU'],
            characteristics: {
              1: 5,
              2: 5,
              3: 4,
              4: 5
            }
          })
          .then(res => {
            postResponse = res;
            axios
              .get('http://localhost:3000/reviews/1/list?count=1000')
              .then(res => {
                review = res.data.results[res.data.results.length - 2]; // grab most recent review
                resolve();
              });
          })
          .catch(err => reject(err));
      })
  );

  it('should respond to POST requests', () => {
    expect(postResponse.status).to.equal(201);
  });

  it('should fetch POSTed review with correct information', () => {
    expect(review.review_id).to.be.a('number');
    expect(review.rating).to.equal(5);
    expect(review.summary).to.equal('A very rad product!!');
    expect(review.body).to.equal(
      'This product was very good but also very radical. I appreciate the symmetry.'
    );
    expect(review.recommended).to.equal(1);
    expect(review.reviewer_name).to.equal('ian');
    expect(review.photos[0].url).to.equal(
      'https://unsplash.com/photos/TQxUc5q8paU'
    );
    expect(review.photos[0].id).to.be.a('number');
    expect(review.date).to.be.a('string');
    expect(review.helpfulness).to.be.a('number');
  });
});
