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
npm run quasar build

# Build docker

quasar build

cmd="docker build \
  -t $DOCKER_IMAGE \
  -f $DIR/Dockerfile $BUILDROOT"
echo $cmd
eval $cmd

