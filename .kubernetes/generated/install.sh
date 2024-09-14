#!/bin/bash
set -e

# docker regcred for pull docker images
microk8s kubectl delete secret docker-regcred || echo 'not need delete secret docker-regcred'
microk8s kubectl create secret docker-registry docker-regcred --docker-server=%DOCKER_SERVER% --docker-username=%DOCKER_USERNAME% --docker-password=%DOCKER_PASSWORD% --docker-email=docker-regcred

# namespace and common config
microk8s kubectl apply -f .kubernetes/generated/node
microk8s kubectl get secret docker-regcred -n default -o yaml || sed s/"namespace: default"/"namespace: master"/ || microk8s kubectl apply -n master -f - || echo 'not need update docker-regcred'

# server
microk8s kubectl apply -f .kubernetes/generated/server

# client
microk8s kubectl apply -f .kubernetes/generated/client
