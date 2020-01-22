const express = require('express');
const app = express();
const parser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3000;

const client = require('redis').createClient(
  process.env.REDIS_PORT || 6379,
  process.env.REDIS_HOST || 'localhost'
);
const { incrementIfNotExist } = require('./helpers.js');
const {
  getAllReviews,
  getPhotosForReview,
  getProductMeta,
  addReview,
  query,
  checkCache
} = require('./models.js');

client.on('connect', () =>
  console.log(
    `Redis connected to ${process.env.redisHost || 'redis'} on ${process.env
      .redisPort || 6379}`
  )
);
client.on('error', err => (test = err));

app.use(parser.json());
app.use(cors());

app.get('/reviews/:product_id/list', (req, res) => {
  res.json({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'reviews_api',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    max: 20,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 3000,
    redis: process.env.redisHost
  });
  checkCache(req.url)
    .then(parsedData => {
      res.status(200).json(parsedData);
    })
    .catch(err => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      }
      const prodId = req.params.product_id;
      getAllReviews(
        prodId,
        req.query.sort,
        req.query.page,
        req.query.count,
        res
      )
        .then(reviews => {
          const queries = [];
          for (let review of reviews) {
            queries.push(
              getPhotosForReview(review.review_id).catch(err =>
                res.sendStatus(500)
              )
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
              client.set(req.url, JSON.stringify(result));
              res.status(200).json(result);
            })
            .catch(err => {
              console.error(err);
              res.sendStatus(500);
            });
        })
        .catch(() => res.sendStatus(500));
    });
});

app.get('/reviews/:product_id/meta', (req, res) => {
  const prodId = req.params.product_id;
  checkCache(req.url)
    .then(parsedData => {
      res.status(200).json(parsedData);
    })
    .catch(err => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      }
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
            if (!cache.hasOwnProperty(entry.id)) {
              result.ratings[entry.rating] = incrementIfNotExist(
                result.ratings,
                entry.rating
              );
              result.recommended[entry.recommended] = incrementIfNotExist(
                result.recommended,
                entry.recommended
              );

              cache[entry.id] = entry.id;
              cache.numOfReviews += 1;
            } else {
              cache[entry.id] = entry.id;
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

          client.set(req.url, JSON.stringify(result));
          res.status(200).json(result);
        })
        .catch(err => {
          console.error(err);
          res.sendStatus(500);
        });
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
  query(queryStr, res)
    .then(() => res.sendStatus(201))
    .catch(err => {
      console.error(err);
      res.json({ error: err });
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

app.get('/loaderio-a2a96766ee81837e3524963dd0334598', (req, res) =>
  res.send('loaderio-a2a96766ee81837e3524963dd0334598')
);

app.get('/kubernetes', (req, res) => res.send('KUBERNETES'));

app.listen(PORT, err => console.log(err || `Listening on port ${PORT}.`));
