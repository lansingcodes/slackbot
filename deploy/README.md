# Docker Deployment

Instructions to prepare for a Docker deployment via Circle CI.

## Pre-requisites

* Circle CI deployment setup
* Server with Docker installed
* Redis instance

## Instructions

1. Create a user for lubot: `sudo useradd lubot -m` and generate a privatedocker-compose for the user
2. Give the new user sudo privileges for docker-compose commands using the `lubot.sudo` file
3. Add the `lubotrc.sample` file as `lubotrc` to the lubot home directory and update as necessary.
4. Add the public key for the user to CircleCI

Additionally, there is setup on AWS

1. Create and push image to Amazon Container Registry
2. Create an IAM user with `policy.json` as a policy for that user
3. Add AWS credentials to CircleCI

## Debugging

Several commands are useful for debugging lubot server side.  This requires the
private key associated with the user.  Once an SSH connection has been made, the
following commands can be used:

* `sudo docker-compose restart lubot`: Restarts the lubot container
* `sudo docker-compose logs lubot`: Shows the logs for lubot
* `sudo docker-compose exec lubot sh`: Interactive shell inside the container.  Will not have all the Linux tools you're used to.
