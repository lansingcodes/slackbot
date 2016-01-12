FROM smebberson/alpine-nodejs

ENV NODE_VERSION v5.0.0
ENV NPM_VERSION 3.3.9

RUN apk add --update tzdata \
    && rm -rf /var/cache/apk*

# cache our packages.json
ADD package.json /tmp/
RUN cd /tmp && npm install
RUN mkdir -p /opt/hubot && cp -a /tmp/node_modules /opt/hubot

ADD . /opt/hubot
WORKDIR /opt/hubot

CMD ["/opt/hubot/bin/hubot", "--adapter", "slack"]
