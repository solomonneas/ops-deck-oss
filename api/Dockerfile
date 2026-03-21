FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY src ./src
COPY data ./data
EXPOSE 8005
CMD ["npm", "start"]

