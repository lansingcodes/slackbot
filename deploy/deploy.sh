#!/bin/bash

cd $HOME

source ./dockerrc

echo $DOCKER_PASS | sudo docker login --username $DOCKER_USER --password-stdin
sudo docker-compose pull lubot
sudo docker-compose stop lubot
sudo docker-compose rm -f lubot
sudo docker-compose up -d
