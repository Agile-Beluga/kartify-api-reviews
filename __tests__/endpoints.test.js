const chakram = require('chakram'),
  expect = chakram.expect;

describe('GET /reviews/:product_id/list', () => {
  it('should handle GET requests with a product_id', () => {
    return chakram.get('/reviews/2/list').then(res => {
      expect(res).to.have.status(200);
      expect(res).to.not.have.header('non-existing-header');
      expect(res.body.product).to.equal('2');
      expect(res.body.page).to.equal(0);
      expect(res.body.count).to.equal(5);
      expect(res.body.results.length).isAbove(0);
    });
  });
  it('should handle GET requests with a page param', () => {
    return chakram.get('/reviews/2/list?page=5').then(res => {
      expect(res).to.have.status(200);
      expect(res.body.page).to.equal(5);
    });
  });
  it('should handle GET requests with a count param', () => {
    return chakram.get('/reviews/2/list?count=10').then(res => {
      expect(res).to.have.status(200);
      expect(res.body.count).to.equal(10);
    });
  });
  describe('should sort reviews according to sort param', () => {
    it('should sort reviews by newest', () => {
      return chakram.get('/reviews/2/list?sort=newest').then(res => {
        expect(res).to.have.status(200);
        const times = res.body.results.map(result =>
          new Date(result.date).getTime()
        );
        times.forEach((time, index, results) => {
          const prevTime = results[index + 1] || null;
          expect(time).isAbove(prevTime);
        });
      });
    });
    it('should sort reviews by helpful', () => {
      return chakram.get('/reviews/2/list?sort=helpful').then(res => {
        expect(res).to.have.status(200);
        const helpfulnesses = res.body.results.map(
          result => result.helpfulness
        );
        helpfulnesses.forEach((helpfulness, index, results) => {
          const nextHelpfulness = results[index + 1] || null;
          expect(helpfulness).isAbove(nextHelpfulness);
        });
      });
    });
    // it('should sort reviews by relevance', () => {
    //   return chakram.get('/reviews/2/list?sort=relevant').then(res => {
    //     expect(res).to.have.status(200)
    //     const relevance = res.body.results.map(result => result.rel)
    //   })
    // })
  });
});
