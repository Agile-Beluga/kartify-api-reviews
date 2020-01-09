const express = require('express');
const app = express();
const parser = require('body-parser');
const PORT = process.env.port || 3000;
const db = require('./db');
const { incrementIfNotExist } = require('./helpers.js');
db.connect(err => console.log(err || 'DB connected'));

app.use(parser.json());

app.get('/reviews/:product_id/list', (req, res) => {
  const prodId = req.params.product_id;
  const offset = req.query.page ? req.query.page * (req.query.count || 5) : 0;
  db.query(
    `SELECT * FROM reviews WHERE product_id = ${prodId} LIMIT ${req.query
      .count || 5} OFFSET ${offset}`
  )
    .then(data => {
      const result = {
        results: data.rows,
        product: `${prodId}`,
        count: Number(req.query.count) || 5,
        page: Number(req.query.page) || 0
      };

      new Promise((resolve, reject) => {
        const queries = [];
        result.results = result.results
          .filter(review => review.reported === 0)
          .map(review => {
            const parsedReview = {
              review_id: review.id,
              rating: review.rating,
              summary: review.summary,
              recommended: review.recommended,
              response:
                review.response === null || review.response === 'null'
                  ? ''
                  : review.response,
              body: review.body,
              date: new Date(review.date).toISOString(),
              reviewer_name: review.reviewer_name,
              helpfulness: review.helpfulness
            };

            queries.push(
              db
                .query(`SELECT * FROM photos WHERE review_id = ${review.id}`)
                .then(data => {
                  parsedReview.photos = data.rows.map(row => ({
                    id: row.id,
                    url: row.url
                  }));
                })
                .catch(err => console.error(err))
            );
            return parsedReview;
          });
        Promise.all(queries)
          .then(() => resolve())
          .catch(err => reject(err));
      })
        .then(() => {
          if (req.query.sort === 'newest') {
            result.results.sort((a, b) => {
              return new Date(a.date).getTime() > new Date(b.date).getTime()
                ? -1
                : 1;
            });
          }
          if (req.query.sort === 'helpful') {
            result.results.sort((a, b) =>
              a.helpfulness > b.helpfulness ? -1 : 1
            );
          }
          if (req.query.sort === 'relevant') {
            result.results.sort((a, b) => {
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
          }
          res.status(200).json(result);
        })
        .catch(err => console.error(err));
    })
    .catch(err => res.send(err));
});

app.get('/reviews/:product_id/meta', (req, res) => {
  const product_id = req.params.product_id;
  db.query(
    `select recommended, review_id, value, name, rating, value, characteristic_id
    from (select *
      from (select id, recommended, rating
        from reviews
        where product_id = ${product_id}) as reviews inner join ratings on ratings.review_id = reviews.id) as ratings inner join characteristics as char on char.id = ratings.characteristic_id`
  )
    .then(({ rows }) => {
      const result = {
        product_id,
        ratings: {},
        recommended: {},
        characteristics: {}
      };

      const cache = { characteristics: {}, numOfReviews: 0 };
      rows.forEach(entry => {
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
        if (cache.characteristics.hasOwnProperty(entry.name)) {
          cache.characteristics[entry.name].value += entry.value;
        } else {
          cache.characteristics[entry.name] = {
            id: entry.characteristic_id,
            value: entry.value
          };
        }
      });
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
      res.sendStatus(404);
    });
});

app.listen(PORT, err => console.log(err || `Listening on port ${PORT}.`));
