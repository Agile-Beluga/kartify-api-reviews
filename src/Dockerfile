FROM node:12.14.0

WORKDIR /home/alec/hack-reactor/sprints/week-9/kartify-api-reviews/src
COPY package.json .
RUN npm install
COPY . .

EXPOSE 5000

CMD [ "npm", "start" ]
