const chakram = require('chakram'),
  expect = chakram.expect;

describe('GET /reviews/:product_id/list', () => {
  it('should handle GET requests with a product_id', () => {
    return chakram.get('http://localhost:3000/reviews/15/list').then(res => {
      expect(res).to.have.status(200);
      expect(res).to.not.have.header('non-existing-header');
      expect(res.body.product).to.equal('15');
      expect(res.body.page).to.equal(0);
      expect(res.body.count).to.equal(5);
      expect(res.body.results.length).to.be.above(0);
      const review = res.body.results[0];
      expect(review.response).to.equal('');
      expect(review.rating).to.be.a('number');
      expect(review).to.have.property('review_id');
      expect(review).to.have.property('photos');
      expect(review.photos[0]).to.have.property('id');
      expect(review.photos[0].id).to.be.a('number');
      expect(review.photos[0]).to.have.property('url');
      expect(review.photos[0].url).to.be.a('string');

      return chakram.wait();
    });
  }).timeout(9000);
  it('should filter out reported reviews', () => {
    return chakram.get('http://localhost:3000/reviews/7/list').then(res => {
      expect(res).to.have.status(200);
      expect(res.body.results.length).to.equal(1);
    });
  }).timeout(7000);
  it('should handle GET requests with a page param', () => {
    return chakram
      .get('http://localhost:3000/reviews/20/list?page=1')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.page).to.equal(1);
        const firstResult = res.body.results[0];
        return chakram
          .get('http://localhost:3000/reviews/20/list')
          .then(res => {
            expect(res.body.results[0].review_id).to.not.equal(
              firstResult.review_id
            );
            return chakram.wait();
          });
      });
  }).timeout(20000);
  it('should handle GET requests with a count param', () => {
    return chakram
      .get('http://localhost:3000/reviews/20/list?count=10')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.count).to.equal(10);
        expect(res.body.results.length).to.be.above(5);
        return chakram.wait();
      });
  }).timeout(9000);
  describe('should sort reviews according to sort param', () => {
    it('should sort reviews by newest', () => {
      return chakram
        .get('http://localhost:3000/reviews/2/list?sort=newest')
        .then(res => {
          expect(res).to.have.status(200);
          const times = res.body.results.map(result =>
            new Date(result.date).getTime()
          );
          times.forEach((time, index, results) => {
            const prevTime = results[index + 1] || null;
            expect(time).is.above(prevTime);
          });
        });
    }).timeout(9000);
    it('should sort reviews by helpfulness', () => {
      return chakram
        .get('http://localhost:3000/reviews/2/list?sort=helpful')
        .then(res => {
          expect(res).to.have.status(200);
          const helpfulnesses = res.body.results.map(
            result => result.helpfulness
          );
          helpfulnesses.forEach((helpfulness, index, results) => {
            const nextHelpfulness = results[index + 1] || null;
            expect(helpfulness >= nextHelpfulness).to.equal(true);
          });
        });
    }).timeout(9000);
    it('should sort reviews by relevance', () => {
      return chakram
        .get('http://localhost:3000/reviews/2/list?sort=relevant')
        .then(res => {
          expect(res).to.have.status(200);
          const relevances = res.body.results.map(result => {
            const time = new Date(result.date).getTime();
            const helpfulness = result.helpfulness;
            return time + (helpfulness * 2) / time + helpfulness; // weighted average
          });
          relevances.forEach((relevance, index, relevances) => {
            const nextRelevance = relevances[index + 1] || null;
            expect(relevance >= nextRelevance).to.equal(true);
          });
        });
    }).timeout(9000);
  });
});
