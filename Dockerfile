FROM node:20-alpine

WORKDIR /app

# Copy root & service package configs
COPY bms-backend/package*.json ./bms-backend/

RUN cd bms-backend && npm install --omit=dev

# Copy compiled backend & frontend assets
COPY . .

EXPOSE 80 8080

CMD ["sh", "-c", "cd bms-backend && PORT=8080 node dist/server.js"]
