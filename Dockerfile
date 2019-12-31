FROM node:12.14.0

WORKDIR /home/alec/hack-reactor/sprints/week-9/kartify-api-reviews
COPY package.json .
RUN npm install
COPY . .

CMD [ "npm", "start" ]
