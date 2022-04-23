# Dockerfile
FROM node:16.14.0-alpine

# create destination directory
RUN mkdir -p /usr/src/evelyne-dheliat
WORKDIR /usr/src/evelyne-dheliat
RUN chown -R node:node /usr/src/evelyne-dheliat

# install clean-modules
RUN npm install -g clean-modules

# copy the app, note .dockerignore
COPY --chown=node:node . /usr/src/evelyne-dheliat
RUN npm install

# remove unused modules
RUN clean-modules --yes

# add timezone change
RUN apk add --no-cache tzdata
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# don't run container as root
USER node

CMD [ "node", "index.js" ]
