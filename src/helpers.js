module.exports.incrementIfNotExist = (obj, key, value) => {
  if (!value) return obj.hasOwnProperty(key) ? obj[key] + 1 : 1;
  return obj.hasOwnProperty(key) ? obj[key] + value : value;
};

module.exports.parseReviews = (
  reviews,
  sort = 'relevant',
  page = 0,
  count = 5
) => {
  sortedReviews = reviews.slice();

  switch (sort) {
    case 'newest':
      sortedReviews.sort((a, b) => {
        return new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1;
      });
      break;
    case 'helpful':
      sortedReviews.sort((a, b) => (a.helpfulness > b.helpfulness ? -1 : 1));
      break;
    case 'relevant':
      sortedReviews.sort((a, b) => {
        const aRelevance =
          new Date(a.date).getTime() +
          (a.helpfulness * 2) / new Date(a.date).getTime() +
          a.helpfulness;
        const bRelevance =
          new Date(b.date).getTime() +
          (b.helpfulness * 2) / new Date(b.date).getTime() +
          b.helpfulness;
        return aRelevance > bRelevance ? -1 : 1;
      });
      break;
  }
  const slicedResults = sortedReviews.slice(page * count, page * count + count);
  return slicedResults.map(review => {
    return {
      review_id: review.id,
      rating: review.rating,
      summary: review.summary,
      recommedned: review.recommended,
      response:
        review.response === null || review.response === 'null'
          ? ''
          : review.response,
      body: review.body,
      date: new Date(review.date).toISOString(),
      reviewer_name: review.reviewer_name,
      helpfulness: review.helpfulness
    };
  });
};

module.exports.getDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear().toString();
  return `${yyyy}-${mm}-${dd}`;
};
