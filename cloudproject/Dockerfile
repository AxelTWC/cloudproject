FROM node:22
WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install --save-dev @types/jsonwebtoken @types/bcrypt

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
