FROM node

ENV NODE_VERSION 5.0.0
ENV NPM_VERSION 3.3.9

# cache our packages.json
ADD package.json /tmp/
RUN cd /tmp && npm install
RUN mkdir -p /opt/hubot && cp -a /tmp/node_modules /opt/hubot

ADD . /opt/hubot
WORKDIR /opt/hubot

CMD ["/opt/hubot/bin/hubot", "--adapter", "slack"]

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /var/tmp/*
