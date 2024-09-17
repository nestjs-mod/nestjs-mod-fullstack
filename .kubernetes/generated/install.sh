#!/bin/bash
set -e

# docker regcred for pull docker images
sudo microk8s kubectl delete secret docker-regcred || echo 'not need delete secret docker-regcred'
sudo microk8s kubectl create secret docker-registry docker-regcred --docker-server=%DOCKER_SERVER% --docker-username=%DOCKER_USERNAME% --docker-password=%DOCKER_PASSWORD% --docker-email=docker-regcred

# namespace and common config
sudo microk8s kubectl apply -f .kubernetes/generated/node
sudo microk8s kubectl get secret docker-regcred -n default -o yaml || sed s/"namespace: default"/"namespace: master"/ || microk8s kubectl apply -n master -f - || echo 'not need update docker-regcred'

# server
sudo microk8s kubectl delete -f .kubernetes/generated/server/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/server

# client
sudo microk8s kubectl delete -f .kubernetes/generated/client/1.configmap.yaml || echo 'not need delete configmap'
sudo microk8s kubectl apply -f .kubernetes/generated/client

# depricated
sudo microk8s kubectl delete service master-client-global --namespace master || echo 'not need delete master-client-global'
