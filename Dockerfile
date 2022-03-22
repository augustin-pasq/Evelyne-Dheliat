# Dockerfile
FROM node:16.14.0-alpine

# create destination directory
RUN mkdir -p /usr/src/moodisc
WORKDIR /usr/src/moodisc

# copy the app, note .dockerignore
COPY . /usr/src/moodisc
RUN npm install

# change timezone
RUN apk add --no-cache tzdata
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD [ "node", "index.js" ]
