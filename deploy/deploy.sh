#!/bin/bash

cd $HOME

$(aws ecr get-login --region us-east-1)
sudo docker-compose pull lubot
sudo docker-compose stop lubot
sudo docker-compose rm -f lubot
sudo docker-compose up -d
