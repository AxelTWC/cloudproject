FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx next start -p ${PORT:-3000}"]
