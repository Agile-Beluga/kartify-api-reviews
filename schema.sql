CREATE TABLE reviews
(
  id INT PRIMARY KEY,
  rating INT,
  summary VARCHAR(255),
  recommended INT,
  response VARCHAR(255),
  body VARCHAR(255),
  date VARCHAR(255),
  reviewer_name VARCHAR(255),
  helpfulness INT,
  product_id INT
);

CREATE TABLE characteristics
(
  id INT PRIMARY KEY,
  name VARCHAR(255),
  product_id INT
);

CREATE TABLE photos
(
  id INT PRIMARY KEY,
  url VARCHAR(255),
  review_id INT REFERENCES reviews(id)
);

CREATE TABLE ratings
(
  id INT PRIMARY KEY,
  value INT,
  characteristic_id INT REFERENCES characteristics(id)
);