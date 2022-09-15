#!/bin/bash
GIT_BRANCH="$(git branch --show-current)"
GIT_HEAD="$(git rev-parse --short=7 HEAD)"
GIT_DATE=$(git log HEAD -n1 --pretty='format:%cd' --date=format:'%Y%m%d-%H%M')

# REPO="镜像仓库"
# CONTAINER="镜像名"
# TAG="${GIT_BRANCH}-${GIT_HEAD}-${GIT_DATE}"
# DOCKER_IMAGE=$REPO/$CONTAINER:$TAG

DOCKER_IMAGE="frontend"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILDROOT=$DIR
# Build staic
npm install --registry=http://registry.npmmirror.com
npm run build

# Build docker

cmd="docker build \
  -t $DOCKER_IMAGE \
  -f $DIR/Dockerfile $BUILDROOT"
echo $cmd
eval $cmd

start="docker run -it --rm --restart=always -p 80:80 -e API=10.10.0.208:8080 frontend:latest"
echo $cmd & eval $cmd
