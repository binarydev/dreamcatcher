FROM node:12-bullseye-slim

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4

# Install dependencies of chromium bundled with puppeteer
RUN apt-get update \
    && apt-get install -y wget libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libdrm2 \
      libexpat1 libgbm1 libgcc1 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
       libx11-6 libx11-xcb1 libxcb-dri3-0 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
       libxrender1 libxss1 libxtst6 bash xdg-utils \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /src/*.deb

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

COPY server.js start.js browserManager.js helpers.js package.json package-lock.json /app/
COPY /fonts /usr/share/fonts/
WORKDIR /app
RUN npm install

ENTRYPOINT ["dumb-init", "--", "npm", "start"]
