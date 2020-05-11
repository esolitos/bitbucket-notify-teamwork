FROM wodby/node:10

ENV NODE_PORT 3030

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3030

VOLUME ["${APP_ROOT}/storage"]

CMD ["npm", "run", "start"]
