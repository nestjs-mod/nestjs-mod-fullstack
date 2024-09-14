#!/bin/bash
set -e

# docker regcred for pull docker images
sudo microk8s kubectl delete secret docker-regcred 2>&1 >/dev/null & || echo 'not need delete secret docker-regcred'
sudo microk8s kubectl create secret docker-registry docker-regcred --docker-server=%DOCKER_SERVER% --docker-username=%DOCKER_USERNAME% --docker-password=%DOCKER_PASSWORD% --docker-email=docker-regcred 2>&1 >/dev/null &

# namespace and common config
sudo microk8s kubectl apply -f .kubernetes/generated/node 2>&1 >/dev/null &
sudo microk8s kubectl get secret docker-regcred -n default -o yaml 2>&1 >/dev/null & || sed s/"namespace: default"/"namespace: %NAMESPACE%"/ || microk8s kubectl apply -n %NAMESPACE% -f - 2>&1 >/dev/null & || echo 'not need update docker-regcred'

# server
sudo microk8s kubectl apply -f .kubernetes/generated/server 2>&1 >/dev/null &

# client
sudo microk8s kubectl apply -f .kubernetes/generated/client 2>&1 >/dev/null &
