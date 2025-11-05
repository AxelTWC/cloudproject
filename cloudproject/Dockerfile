FROM node:22
WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install --save-dev @types/jsonwebtoken @types/bcrypt

COPY . .

# Generate the Prisma client (required before building because server imports @prisma/client)
RUN npx prisma generate

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
