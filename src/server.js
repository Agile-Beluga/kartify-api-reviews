const express = require('express');
const app = express();
const parser = require('body-parser');
const PORT = process.env.PORT || 3000;
const { incrementIfNotExist } = require('./helpers.js');
const {
  getAllReviews,
  getPhotosForReview,
  getProductMeta,
  addReview,
  query
} = require('./models.js');

app.use(parser.json());

app.get('/reviews/:product_id/list', (req, res) => {
  const prodId = req.params.product_id;
  getAllReviews(prodId, req.query.sort, req.query.page, req.query.count)
    .then(reviews => {
      const queries = [];
      for (let review of reviews) {
        queries.push(
          getPhotosForReview(review.review_id).catch(err => res.sendStatus(500))
        );
      }
      Promise.all(queries)
        .then(photos => {
          const result = {
            results: reviews,
            product: `${prodId}`,
            count: Number(req.query.count) || 5,
            page: Number(req.query.page) || 0
          };
          for (let i = 0; i < photos.length; i++) {
            result.results[i].photos = photos[i].rows;
          }
          res.status(200).json(result);
        })
        .catch(err => {
          console.error(err);
          res.sendStatus(500);
        });
    })
    .catch(() => res.sendStatus(500));
});

app.get('/reviews/:product_id/meta', (req, res) => {
  const prodId = req.params.product_id;
  getProductMeta(prodId)
    .then(rows => {
      const result = {
        prodId,
        ratings: {},
        recommended: {},
        characteristics: {}
      };

      const cache = { characteristics: {}, numOfReviews: 0 };
      rows.forEach(entry => {
        // if review hasn't already been encountered, add data to result
        if (!cache.hasOwnProperty(entry.review_id)) {
          result.ratings[entry.rating] = incrementIfNotExist(
            result.ratings,
            entry.rating
          );
          result.recommended[entry.recommended] = incrementIfNotExist(
            result.recommended,
            entry.recommended
          );

          cache[entry.review_id] = entry.review_id;
          cache.numOfReviews += 1;
        } else {
          cache[entry.review_id] = entry.review_id;
        }

        // can't use incrementIfNotExist here due to different behavior in `else` block
        // essentially, we're just keeping track of the characteristic_id and total value for a given characteristic
        if (cache.characteristics.hasOwnProperty(entry.name)) {
          cache.characteristics[entry.name].value += entry.value;
        } else {
          cache.characteristics[entry.name] = {
            id: entry.characteristic_id,
            value: entry.value
          };
        }
      });

      // get an average value and package it with the characteristic_id for each characteristic
      for (let char in cache.characteristics) {
        const avg = cache.characteristics[char].value / cache.numOfReviews;
        result.characteristics[char] = {
          id: cache.characteristics[char].id,
          value: avg.toFixed(4)
        };
      }

      res.status(200).json(result);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

app.post('/reviews/:product_id', (req, res) => {
  const prodId = req.params.product_id;

  let insertPhotosQuery = `INSERT INTO photos (review_id, url) VALUES`;
  req.body.photos.forEach((photoUrl, index) => {
    if (index !== 0) insertPhotosQuery += ', ';
    insertPhotosQuery += `((select MAX(id) FROM reviews), '${photoUrl}')`;
  });
  let insertRatingsQuery = `INSERT INTO ratings (characteristic_id, review_id, value) VALUES`;
  Object.keys(req.body.characteristics).forEach((char, index) => {
    if (index !== 0) insertRatingsQuery += ', ';
    insertRatingsQuery += `(${char}, (select MAX(id) FROM reviews), ${req.body.characteristics[char]})`;
  });

  addReview(prodId, insertPhotosQuery, insertRatingsQuery, req.body)
    .then(() => {
      res.sendStatus(201);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

app.put('/reviews/helpful/:review_id', (req, res) => {
  const queryStr = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = ${req.params.review_id}`;
  query(queryStr)
    .then(() => res.sendStatus(201))
    .catch(err => {
      console.error(err);
      res.sendStatus(404);
    });
});

app.put('/reviews/report/:review_id', (req, res) => {
  const queryStr = `UPDATE reviews SET reported = 1 WHERE id = ${req.params.review_id}`;
  query(queryStr)
    .then(() => res.sendStatus(201))
    .catch(err => {
      console.error(err);
      res.sendStatus(404);
    });
});

app.listen(PORT, err => console.log(err || `Listening on port ${PORT}.`));
