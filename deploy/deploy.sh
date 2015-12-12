#!/bin/bash

cd $HOME
source lubotrc

if [ ! -d lubot ]; then
  git clone https://github.com/lansingcodes/lubot.git
fi

cd $HOME/lubot
git fetch origin
git reset --hard origin/master

sudo docker build -t lansingcodes/lubot .

sudo docker rm -f lubot
sudo docker run -d --restart=always --name lubot \
  -e HUBOT_SLACK_TOKEN=$HUBOT_SLACK_TOKEN \
  -e TWITTER_LANSINGCODES_CONSUMER_KEY=$TWITTER_LANSINGCODES_CONSUMER_KEY \
  -e TWITTER_LANSINGCODES_CONSUMER_SECRET=$TWITTER_LANSINGCODES_CONSUMER_SECRET \
  -e TWITTER_LANSINGCODES_ACCESS_TOKEN=$TWITTER_LANSINGCODES_ACCESS_TOKEN \
  -e TWITTER_LANSINGCODES_ACCESS_TOKEN_SECRET=$TWITTER_LANSINGCODES_ACCESS_TOKEN_SECRET \
  -e GOOGLE_API_KEY=$GOOGLE_API_KEY \
  -e LUBOT_MEETUP_API_KEY=$LUBOT_MEETUP_API_KEY \
  -e TZ=$TZ \
  -e REDIS_URL=$REDIS_URL \
  lansingcodes/lubot
