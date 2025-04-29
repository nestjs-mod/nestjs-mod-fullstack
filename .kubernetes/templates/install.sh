#!/bin/bash
set -e

# namespace and common config
sudo microk8s kubectl apply -f .kubernetes/generated/node

# docker regcred for pull docker images
sudo microk8s kubectl delete secret -n %NAMESPACE% docker-regcred || echo 'not need delete secret docker-regcred'
sudo microk8s kubectl create secret -n %NAMESPACE% docker-registry docker-regcred --docker-server=%DOCKER_SERVER% --docker-username=%DOCKER_USERNAME% --docker-password=%DOCKER_PASSWORD% --docker-email=docker-regcred

# authorizer
sudo microk8s kubectl delete -f .kubernetes/templates/authorizer/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/authorizer

# minio
sudo microk8s kubectl delete -f .kubernetes/templates/minio/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/minio

# redis
sudo microk8s kubectl delete -f .kubernetes/templates/redis/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/redis

# server
sudo microk8s kubectl delete -f .kubernetes/templates/server/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/server

# client
sudo microk8s kubectl delete -f .kubernetes/templates/client/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/client

# depricated
sudo microk8s kubectl delete service %NAMESPACE%-client-global --namespace %NAMESPACE% || echo 'not need delete %NAMESPACE%-client-global'
