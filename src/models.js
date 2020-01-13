const { parseReviews, getDate } = require('./helpers.js');
const pool = require('./db');

const query = queryString => {
  return pool.connect().then(client => {
    return client
      .query(queryString)
      .then(data => {
        client.release();
        return data;
      })
      .catch(err => {
        console.error(err);
        client.release();
        throw err;
      });
  });
};

module.exports.query = query;

module.exports.getAllReviews = (prodId, sort, page, count) => {
  return query(
    `SELECT * FROM reviews WHERE product_id = ${prodId} AND reported = 0`
  )
    .then(({ rows }) => {
      return parseReviews(rows, sort, page, count);
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
};

module.exports.getPhotosForReview = reviewId => {
  return query(`SELECT id, url FROM photos WHERE review_id = ${reviewId}`)
    .then(({ rows }) => rows)
    .catch(err => {
      console.error(err);
      throw err;
    });
};

module.exports.getProductMeta = prodId => {
  const queryStr = `select recommended, review_id, value, name, rating, value, characteristic_id
  from (select *
    from (select id, recommended, rating
      from reviews
      where product_id = ${prodId}) as reviews inner join ratings on ratings.review_id = reviews.id) as ratings inner join characteristics as char on char.id = ratings.characteristic_id`;
  return query(queryStr)
    .then(({ rows }) => rows)
    .catch(err => {
      console.error(err);
      throw err;
    });
};

module.exports.addReview = (
  prodId,
  insertPhotosQuery,
  insertRatingsQuery,
  reqBody
) => {
  const transaction = `
    BEGIN;
      LOCK TABLE reviews IN EXCLUSIVE MODE;
      INSERT INTO reviews
        (product_id, rating, date, summary, body, recommended, reported, reviewer_name, reviewer_email, response, helpfulness)
      VALUES
        (${prodId}, '${reqBody.rating}', '${getDate()}', '${
    reqBody.summary
  }', '${reqBody.body}', ${reqBody.recommended ? 1 : 0}, 0, '${
    reqBody.name
  }', '${reqBody.email}', null, 0);
        ${insertPhotosQuery};
        ${insertRatingsQuery};
    COMMIT;
`;
  return query(transaction).catch(err => {
    console.error(err);
    throw err;
  });
};
