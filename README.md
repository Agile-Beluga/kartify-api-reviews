# Kartify API - Reviews
## Overview
Kartify API is a back-end responsible for serving millions of records at scale to an e-commerce front-end. This particular module of the API, Reviews, contains data regarding user reviews for over a million products. 

### Table of Contents 
[Description](#Description)

[Installation](#Installation)

[Usage](#Usage) 

[License](#License)

## Description
Kartify API is an API backend designed to scale in order to serve over a thousand requests per second. The Reviews module in particular serves user review data for over a million products.

The server is built using Node.js / Express and uses a PostgreSQL database for storing all review data. Redis is used to cache commonly accessed data according to a Least Recently Used (LRU) policy. Finally, the entire application is containerized using Docker and ready to be deployed as a Kubernetes cluster with load balancing.  

## Installation
You can use either Docker to install the application or go a step further with Kubernetes.

### Docker
The first thing you'll want to do to get the application installed and running on Docker is to rename the `docker-compose-template.yaml` file to `docker-compose.yaml`. Next, change the `POSTGRES_PASSWORD` and `POSTGRES_USER` db environment variables to your desired PostgreSQL database credential, and change the `DB_USER` and `DB_PASS` server environment variables to match. By default, the server is mapped to run on port `4000` while the db service is mapped to port `5432`. The db service also presumes the existence of a `reviews_api` database. Also established is a bind volume in the `/database/api_data/` directory, so that the db container has access to initial seed data stored in CSV files.

In order to establish database persistence inbetween container restarts, change the `# VOLUME TO MAP (DATA)` comment to an empty file directory on your machine so that PostgreSQL can establish a volume to store its data.

#### Database ETL
The database needs to be seeded with data via an Extract, Transfer, Load (ETL) process. This can be done by simply loading the schema into PostgreSQL.

First, get your application (including the database) running with:
```
docker-compose up
```
Then, use the `psql` CLI tool to run the following from within the application's root directory, replacing the `<USERNAME>` tag with the username credential you configured your database container with:
```
psql -h localhost -U <USERNAME> -d reviews_api -f database/schema.sql
```
This command will load the schema into PostgreSQL, copying data from the CSV files into tables as it creates them. Be aware that this may take several minutes.

Congratulations, you have successfully installed and configured Kartify API - Reviews!

### Kubernetes
If you wish to install Kartify API - Reviews as a Kubernetes cluster, a `server_template.yaml` file is includes for easy installation. Please note that this method presupposes a couple of caveats:
1. You have a PostgreSQL DB accessible by a public IP (most likely deployed), as the database isn't part of the cluster. See the aforementioned database setup instructions for Docker above for more information on how to setup a PostgreSQL container.
2. You have installed minikube.

The first step to configure the cluster is to rename the `server_template.yaml` file to `server.yaml`. Within `server.yaml`, configure the `<DATABASE IP>`, `<DATABASE USER>`, and `<DATABASE PASSWORD>` server environment variables to match your external database configuration.

Next, run
```
minikube start vm-driver=none
```
to start minikube. For the sake of simplicity, a virtual machine driver is not confgiured.

After minikube starts up, apply your configuration by running the following in the application's root directory:
```
kubectl apply -f src/server.yaml
```
Now that you've applied your configuration changes, make sure the changes were applied correctly by running:
```
kubectl get services
```
You should see four services running:
```
kubernetes
postgres-entypoint
redis-entrypoint
server-entrypoint
```
If the `EXTERNAL-IP` field for the `server` service is marked as `<pending>`, run the following command to access the pod's interface:
```
minikube tunnel
```
Lastly, just make sure that you make all your RESTful requests to the IP address in the `EXTERNAL-IP` field, and you're good to go!

## Usage
[Documentation for the Reviews API can be found here.](https://gist.github.com/trentgoing/409c2d76ce8e187e2132e45d9bed4605#file-reviews_api-md)

## License
Copyright (c) Alec Champaign

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
