DROP TABLE reviews;
DROP TABLE characteristics;
DROP TABLE photos;
DROP TABLE ratings;

CREATE TABLE reviews
(
  id INT PRIMARY KEY,
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

CREATE TABLE characteristics
(
  id INT PRIMARY KEY,
  product_id INT,
  name text
);

CREATE TABLE photos
(
  id INT PRIMARY KEY,
  review_id INT REFERENCES reviews(id),
  url text
);

CREATE TABLE ratings
(
  id INT PRIMARY KEY,
  characteristic_id INT REFERENCES characteristics(id),
  review_id INT REFERENCES reviews(id),
  value INT
);

CREATE INDEX char_id ON ratings (characteristic_id);
CREATE INDEX rev_rating_id ON ratings (review_id);
CREATE INDEX rev_photos_id ON photos (review_id);