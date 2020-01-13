DROP TABLE reviews;
DROP TABLE characteristics;
DROP TABLE photos;
DROP TABLE ratings;

CREATE TABLE reviews
(
  id SERIAL PRIMARY KEY,
  product_id INT,
  rating INT,
  date text,
  summary text,
  body text,
  recommended INT,
  reported INT,
  reviewer_name text,
  reviewer_email text,
  response text,
  helpfulness INT
);

COPY reviews FROM '/api_data/reviews.csv'
WITH DELIMITER ',' CSV HEADER;

CREATE TABLE characteristics
(
  id SERIAL PRIMARY KEY,
  product_id INT,
  name text
);

COPY characteristics FROM '/api_data/characteristics.csv'
WITH DELIMITER ',' CSV HEADER;

CREATE TABLE photos
(
  id SERIAL PRIMARY KEY,
  review_id INT REFERENCES reviews(id),
  url text
);

COPY photos FROM '/api_data/reviews_photos.csv'
WITH DELIMITER ',' CSV HEADER;

CREATE TABLE ratings
(
  id SERIAL PRIMARY KEY,
  characteristic_id INT REFERENCES characteristics(id),
  review_id INT REFERENCES reviews(id),
  value INT
);

COPY ratings FROM '/api_data/characteristic_reviews.csv'
WITH DELIMITER ',' CSV HEADER;

-- Force the outdated sequence pointers to point at the correct indices
SELECT SETVAL('ratings_id_seq', COALESCE((SELECT MAX(id)+1 FROM ratings), 1), false);
SELECT SETVAL('photos_id_seq', COALESCE((SELECT MAX(id) + 1 FROM photos), 1), false);
SELECT SETVAL('characteristics_id_seq', COALESCE((SELECT MAX(id) + 1 FROM characteristics), 1), false);
SELECT SETVAL('reviews_id_seq', COALESCE((SELECT MAX(id) + 1 FROM reviews), 1), false);

CREATE INDEX char_id ON ratings (characteristic_id);
CREATE INDEX rev_rating_id ON ratings (review_id);
CREATE INDEX rev_photos_id ON photos (review_id);
CREATE INDEX rating_value ON ratings (value);
CREATE INDEX char_name ON characteristics (name);
CREATE INDEX rev_rating ON reviews (rating);
CREATE INDEX recommended_reviews ON reviews (recommended);
CREATE INDEX product_id_reviews ON reviews (product_id);