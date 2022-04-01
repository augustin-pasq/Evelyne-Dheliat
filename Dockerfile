# Dockerfile
FROM node:16.14.0-alpine

# create destination directory
RUN mkdir -p /usr/src/moodisc
WORKDIR /usr/src/moodisc
RUN chown -R node:node /usr/src/moodisc

# install clean-modules
RUN npm install -g clean-modules

# copy the app, note .dockerignore
COPY --chown=node:node . /usr/src/moodisc
RUN npm install

# remove unused modules
RUN clean-modules --yes

# don't run container as root
USER node

# change timezone
RUN apk add --no-cache tzdata
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD [ "node", "index.js" ]
