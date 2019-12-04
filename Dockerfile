FROM wodby/node:10

ENV NODE_PORT 3030

COPY package*.json ./

RUN npm install --only=prod

COPY . .

EXPOSE 3030

CMD ["npm", "run", "start"]
