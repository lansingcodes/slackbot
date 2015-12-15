# Docker Deployment

Instructions to prepare for a Docker deployment via Circle CI.

## Pre-requisites

* Circle CI deployment setup
* Server with Docker installed
* Redis instance

## Instructions

1. Create a user for lubot: `sudo useradd lubot -m` and add the public key
2. Give the new user sudo privileges for the necessary Docker commands using the `lubot.sudo` file
3. Add the `deploy.sh` file to the lubot home directory.
4. Add the `lubotrc.sample` file as `lubotrc` to the lubot home directory and update as necessary.

## Debugging

Several commands are useful for debugging lubot server side.  This requires the
private key associated with the user.  Once an SSH connection has been made, the
following commands can be used:

* `sudo docker restart lubot`: Restarts the lubot container
* `sudo docker logs lubot`: Shows the logs for lubot
* `sudo docker-enter lubot`: Interactive shell inside the container.  Will not have all the Linux tools you're used to.
