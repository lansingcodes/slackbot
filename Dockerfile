FROM  mhart/alpine-node

RUN apk add --update tzdata \
    && rm -rf /var/cache/apk*

ADD . /opt/hubot
WORKDIR /opt/hubot
RUN npm install

CMD ["/opt/hubot/bin/hubot", "--adapter", "slack"]
