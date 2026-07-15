FROM node:26

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
RUN npm run build:front

ENV PORT=8000
EXPOSE 8000


CMD ["npm", "run", "start:prod"]
