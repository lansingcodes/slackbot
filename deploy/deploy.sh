#!/bin/bash

cd $HOME

sudo docker-compose pull lubot
sudo docker-compose stop lubot
sudo docker-compose rm -f lubot
sudo docker-compose up -d
