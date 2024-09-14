#!/bin/bash
set -e

# server
microk8s kubectl delete -f ./server | echo 'not need delete server'

# client
microk8s kubectl delete -f ./server | echo 'not need delete client'
