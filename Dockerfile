# Use Ubuntu 16.04 LTS server image as the base
FROM ubuntu:16.04

# Updating ubuntu packages
RUN apt-get update

# Installing the OS pre-reqs needed to run Nightmare and generate screenshots/pdfs with proper fonts
RUN apt-get install --fix-missing -y \
  xvfb \
  x11-xkb-utils \
  xfonts-100dpi \
  xfonts-75dpi \
  xfonts-scalable \
  xfonts-cyrillic \
  x11-apps \
  clang \
  libdbus-1-dev \
  libgtk2.0-dev \
  libnotify-dev \
  libgnome-keyring-dev \
  libgconf2-dev \
  libasound2-dev \
  libcap-dev \
  libcups2-dev \
  libxtst-dev \
  libxss1 \
  libnss3-dev \
  gcc-multilib \
  g++-multilib \
  git \
  wget

EXPOSE 80

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 4.4.4

# INSTALL NVM and NODE 4.4.4 LTS - Since each RUN executes within its own image, 
# this all needs to happen within the same image to maintain ENV vars
RUN git clone https://github.com/creationix/nvm.git $NVM_DIR && \
    cd $NVM_DIR && \
    git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" origin` && \
    . "$NVM_DIR/nvm.sh" && \
    nvm install $NODE_VERSION && \
    npm install && \
    echo "export NVM_DIR=\"/root/.nvm\" \n \n [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"" >> "/root/.bashrc"

ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

ADD . /app

WORKDIR /app

RUN chmod a+x start.sh

CMD ./start.sh