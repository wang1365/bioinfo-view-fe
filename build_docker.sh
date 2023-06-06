#!/bin/bash
# 说明，本脚本适用于直接用构建好的dist包进行项目启动
# 脚本包含2个参数，第一个为前端端口，第二个为后端地址加端口，2个都不填的情况下默认分别为80和10.10.0.208:8080
# 使用举例：./build_docker.sh 9090 10.10.0.222:8080 , 该例子中指定了前端页面端口为9090，后端API为10.10.0.222:8080

FE_PORT=$1
BE=$2

echo "FE PORT: ${FE_PORT}"
echo "BE :${BE}"


# CONTAINER="镜像名"
TAG=$(date '+%Y%m%d%H%M%S')
# DOCKER_IMAGE=$REPO/$CONTAINER:$TAG

DOCKER_IMAGE="bioinfo-view-ui"
CONTAINER_NAME="bioinfo-view-ui"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILDROOT=$DIR

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

start="docker run --name ${CONTAINER_NAME} -dit --restart=always -p ${FE_PORT:-80}:80 \
  -v /data/bioinfo:/data/bioinfo \
  -e API=${BE:-10.10.0.208:8080} ${DOCKER_IMAGE}:${TAG}"
echo $start
eval $start
