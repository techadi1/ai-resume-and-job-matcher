FROM node:20-alpine

WORKDIR /app

# Install curl for docker healthcheck
RUN apk add --no-cache curl

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["npm", "start"]
