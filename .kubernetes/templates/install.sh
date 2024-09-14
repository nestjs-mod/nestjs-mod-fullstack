#!/bin/bash
set -e

# docker regcred for pull docker images
sudo microk8s kubectl delete secret docker-regcred > /dev/null 2>&1 & || echo 'not need delete secret docker-regcred'
sudo microk8s kubectl create secret docker-registry docker-regcred --docker-server=%DOCKER_SERVER% --docker-username=%DOCKER_USERNAME% --docker-password=%DOCKER_PASSWORD% --docker-email=docker-regcred > /dev/null 2>&1 &

# namespace and common config
sudo microk8s kubectl apply -f .kubernetes/generated/node > /dev/null 2>&1 &
sudo microk8s kubectl get secret docker-regcred -n default -o yaml > /dev/null 2>&1 & || sed s/"namespace: default"/"namespace: %NAMESPACE%"/ || microk8s kubectl apply -n %NAMESPACE% -f - > /dev/null 2>&1 & || echo 'not need update docker-regcred'

# server
sudo microk8s kubectl apply -f .kubernetes/generated/server > /dev/null 2>&1 &

# client
sudo microk8s kubectl apply -f .kubernetes/generated/client > /dev/null 2>&1 &
