#!/bin/bash
GIT_BRANCH="$(git branch --show-current)"
GIT_HEAD="$(git rev-parse --short=7 HEAD)"
GIT_DATE=$(git log HEAD -n1 --pretty='format:%cd' --date=format:'%Y%m%d%H%M')

# REPO="镜像仓库"
# CONTAINER="镜像名"
#TAG=$(date '+%Y%m%d%H%M%S')
TAG="${GIT_BRANCH}-${GIT_DATE}-${GIT_HEAD}"
# DOCKER_IMAGE=$REPO/$CONTAINER:$TAG

DOCKER_IMAGE="bioinfo-view-ui"
CONTAINER_NAME="bioinfo-view-ui"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILDROOT=$DIR
# Build staic
npm install --registry=http://registry.npmmirror.com
npm run build

# Build docker

cmd="docker build \
  -t $DOCKER_IMAGE:${TAG} \
  -f $DIR/Dockerfile $BUILDROOT"
echo $cmd
eval $cmd

if [ "$(docker ps -a -f "name=${CONTAINER_NAME}" | wc -l)" -eq 2 ]; then
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
fi

start="docker run --name ${CONTAINER_NAME} -dit --restart=always -p 9090:80 \
  -v /data/bioinfo:/data/bioinfo \
  -e API=10.10.2.50:8080 ${DOCKER_IMAGE}:${TAG}"
echo $start
eval $start
