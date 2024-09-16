## [2024-09-15] Access to the site on NestJS and Angular by domain name with SSL certificate in Kubernetes via Ingress

Working with SSL is very easy to set up in Kubernetes, this is probably one of the main reasons why I started using it, in this article I will describe a simple scenario for connecting it.

### 1. Installing the certificate Manager on a dedicated server

We connect to our server via SSH and enable the cert-manager plugin from MicroK8s.

The cert-manager plugin manages the process of issuing and renewing SSL certificates.

_Commands_

```bash
ssh root@194.226.49.162
microk8s enable cert-manager
```

_Console output_

```bash
root@vps1724252356:~# microk8s enable cert-manager
Infer repository core for addon cert-manager
Enable DNS addon
Infer repository core for addon dns
Addon core/dns is already enabled
Enabling cert-manager
namespace/cert-manager created
customresourcedefinition.apiextensions.k8s.io/certificaterequests.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/certificates.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/challenges.acme.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/clusterissuers.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/issuers.cert-manager.io created
customresourcedefinition.apiextensions.k8s.io/orders.acme.cert-manager.io created
serviceaccount/cert-manager-cainjector created
serviceaccount/cert-manager created
serviceaccount/cert-manager-webhook created
configmap/cert-manager-webhook created
clusterrole.rbac.authorization.k8s.io/cert-manager-cainjector created
clusterrole.rbac.authorization.k8s.io/cert-manager-controller-issuers created
clusterrole.rbac.authorization.k8s.io/cert-manager-controller-clusterissuers created
clusterrole.rbac.authorization.k8s.io/cert-manager-controller-certificates created
clusterrole.rbac.authorization.k8s.io/cert-manager-controller-orders created
clusterrole.rbac.authorization.k8s.io/cert-manager-controller-challenges created
clusterrole.rbac.authorization.k8s.io/cert-manager-controller-ingress-shim created
clusterrole.rbac.authorization.k8s.io/cert-manager-view created
clusterrole.rbac.authorization.k8s.io/cert-manager-edit created
clusterrole.rbac.authorization.k8s.io/cert-manager-controller-approve:cert-manager-io created
clusterrole.rbac.authorization.k8s.io/cert-manager-controller-certificatesigningrequests created
clusterrole.rbac.authorization.k8s.io/cert-manager-webhook:subjectaccessreviews created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-cainjector created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-controller-issuers created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-controller-clusterissuers created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-controller-certificates created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-controller-orders created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-controller-challenges created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-controller-ingress-shim created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-controller-approve:cert-manager-io created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-controller-certificatesigningrequests created
clusterrolebinding.rbac.authorization.k8s.io/cert-manager-webhook:subjectaccessreviews created
role.rbac.authorization.k8s.io/cert-manager-cainjector:leaderelection created
role.rbac.authorization.k8s.io/cert-manager:leaderelection created
role.rbac.authorization.k8s.io/cert-manager-webhook:dynamic-serving created
rolebinding.rbac.authorization.k8s.io/cert-manager-cainjector:leaderelection created
rolebinding.rbac.authorization.k8s.io/cert-manager:leaderelection created
rolebinding.rbac.authorization.k8s.io/cert-manager-webhook:dynamic-serving created
service/cert-manager created
service/cert-manager-webhook created
deployment.apps/cert-manager-cainjector created
deployment.apps/cert-manager created
deployment.apps/cert-manager-webhook created
mutatingwebhookconfiguration.admissionregistration.k8s.io/cert-manager-webhook created
validatingwebhookconfiguration.admissionregistration.k8s.io/cert-manager-webhook created
Waiting for cert-manager to be ready.
..ready
Enabled cert-manager

===========================

Cert-manager is installed. As a next step, try creating a ClusterIssuer
for Let's Encrypt by creating the following resource:

$ microk8s kubectl apply -f - <<EOF
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt
spec:
  acme:
    # You must replace this email address with your own.
    # Let's Encrypt will use this to contact you about expiring
    # certificates, and issues related to your account.
    email: me@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      # Secret resource that will be used to store the account's private key.
      name: letsencrypt-account-key
    # Add a single challenge solver, HTTP01 using nginx
    solvers:
    - http01:
        ingress:
          class: public
EOF

Then, you can create an ingress to expose 'my-service:80' on 'https://my-service.example.com' with:

$ microk8s enable ingress
$ microk8s kubectl create ingress my-ingress \
    --annotation cert-manager.io/cluster-issuer=letsencrypt \
    --rule 'my-service.example.com/*=my-service:80,tls=my-service-tls'
```

### 2. Creating a file in the repository with the resource parameters for creating certificates

There are various free and paid sites that issue SSL certificates, and we can specify in the cert-manager how and from whom to take these certificates.

Personally, I set up only the receipt of certificates from https://letsencrypt.org and https://www.cloudflare.com , this project will use certificates from `Let's Encrypt'.

In order to specify the source for obtaining certificates, we need to create a resource for creating certificates.

Creating the file `.kubernetes/templates/node/8.issuer.yaml`

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
  namespace: cert-manager
spec:
  acme:
    email: nestjs-mod@site15.ru
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: public
```

### 3. We create a file in the repository with the parameters of the Kubernetes entity, which is responsible for proxying external traffic to our services

By default, this entity is created based on Nginx, well, you can configure Traefik, Nginx will be used in this project, since it is substituted by default.

Creating the file `.kubernetes/templates/node/8.issuer.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-client-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/proxy-connect-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-read-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-send-timeout: '3600'
spec:
  rules:
    - host: %SERVER_DOMAIN%
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: %NAMESPACE%-client
                port:
                  number: %NGINX_PORT%
  tls:
    - hosts:
        - %SERVER_DOMAIN%
      secretName: %NAMESPACE%-client-tls
```

### 4. We are slightly changing the CI/CD configuration for the deployment in Kubernetes to eliminate the unnecessary transfer of infrastructure

The pipeline deployment can be divided in different ways, as convenient and as necessary for anyone, but in the current post I will simply prohibit restarting the infrastructure if the application version has not been changed.

Updated version of the application deployment task `.github/workflows/kubernetes.yml`

```yaml
# ...
jobs:
  # ...
  deploy:
    environment: kubernetes
    needs: [check-server-image, build-and-push-migrations-image, build-and-push-server-image, build-and-push-nginx-image, build-and-push-e2e-tests-image]
    runs-on: [self-hosted]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Deploy infrastructure
        if: ${{ needs.check-server-image.outputs.result != 'success' || contains(github.event.head_commit.message, '[skip cache]') || contains(github.event.head_commit.message, '[skip infrastructure]') }}
        env:
          SERVER_APP_DATABASE_NAME: ${{ secrets.SERVER_APP_DATABASE_NAME }}
          SERVER_APP_DATABASE_PASSWORD: ${{ secrets.SERVER_APP_DATABASE_PASSWORD }}
          SERVER_APP_DATABASE_USERNAME: ${{ secrets.SERVER_APP_DATABASE_USERNAME }}
          SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE: ${{ secrets.SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE }}
          SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD: ${{ secrets.SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD }}
          SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME: ${{ secrets.SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME }}
        run: |
          rm -rf ./.kubernetes/generated
          . .kubernetes/set-env.sh && npx -y rucken copy-paste --find=templates --replace=generated --replace-plural=generated --path=./.kubernetes/templates --replace-envs=true
          docker compose -f ./.kubernetes/generated/docker-compose-infra.yml --compatibility down || echo 'docker-compose-infra not started'
          docker compose -f ./.kubernetes/generated/docker-compose-infra.yml --compatibility up -d

      - name: Deploy applications
        env:
          DOCKER_SERVER: ${{ env.REGISTRY }}
          DOCKER_USERNAME: ${{ github.actor }}
          DOCKER_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
          SERVER_APP_DATABASE_NAME: ${{ secrets.SERVER_APP_DATABASE_NAME }}
          SERVER_APP_DATABASE_PASSWORD: ${{ secrets.SERVER_APP_DATABASE_PASSWORD }}
          SERVER_APP_DATABASE_USERNAME: ${{ secrets.SERVER_APP_DATABASE_USERNAME }}
          SERVER_DOMAIN: ${{ secrets.SERVER_DOMAIN }}
        run: |
          rm -rf ./.kubernetes/generated
          . .kubernetes/set-env.sh && npx -y rucken copy-paste --find=templates --replace=generated --replace-plural=generated --path=./.kubernetes/templates --replace-envs=true
          chmod +x .kubernetes/generated/install.sh
          .kubernetes/generated/install.sh > /dev/null 2>&1 &

      - name: Run E2E-tests
        env:
          SERVER_DOMAIN: ${{ secrets.SERVER_DOMAIN }}
        run: |
          rm -rf ./.kubernetes/generated
          . .kubernetes/set-env.sh && npx -y rucken copy-paste --find=templates --replace=generated --replace-plural=generated --path=./.kubernetes/templates --replace-envs=true
          docker compose -f ./.kubernetes/generated/docker-compose-e2e-tests.yml --compatibility up
```

### 5. Changing the address of the tested site in the "Docker Compose" file for E2E tests

Since we now have a domain with an SSL certificate, we no longer need to specify the port with the Nginx global frontend service when running E2E tests.

Updated file `.kubernetes/templates/docker-compose-e2e-tests.yml`

```yaml
version: '3'
networks:
  nestjs-mod-fullstack-network:
    driver: 'bridge'
services:
  nestjs-mod-fullstack-e2e-tests:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-e2e-tests:%ROOT_VERSION%'
    container_name: 'nestjs-mod-fullstack-e2e-tests'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      BASE_URL: 'https://%SERVER_DOMAIN%'
    working_dir: '/usr/src/app'
    volumes:
      - './../../apps:/usr/src/app/apps'
      - './../../libs:/usr/src/app/libs'
```

### 6. We commit the changes and wait for CI/CD to work successfully and check the site operation with our hands

Current result of CI/CD operation: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10877250887
Current site: https://fullstack.nestjs-mod.com

### 7. We are deleting the global service that we created in the previous post

Now we are deploying and testing a site that works through Ingress, which means that we no longer need a site launched as a global service through NodePort and it can be deleted.

You can delete it by connecting to a dedicated server via ssh via the command `sudo microk8s kubectl delete service master-client-global --namespace master`, but it is always advisable to communicate changes through the git repository, since we may have several stands on which we will also need to run this command again.

In this project, we will report the changes via git, for this we will delete the file `.kubernetes/templates/client/4.global-service.yaml` and add the delete command to the application installation script.

Updating the file `.kubernetes/templates/install.sh `

```yaml
#!/bin/bash
set -e

# docker regcred for pull docker images
sudo microk8s kubectl delete secret docker-regcred || echo 'not need delete secret docker-regcred'
sudo microk8s kubectl create secret docker-registry docker-regcred --docker-server=%DOCKER_SERVER% --docker-username=%DOCKER_USERNAME% --docker-password=%DOCKER_PASSWORD% --docker-email=docker-regcred

# namespace and common config
sudo microk8s kubectl apply -f .kubernetes/generated/node
sudo microk8s kubectl get secret docker-regcred -n default -o yaml || sed s/"namespace: default"/"namespace: %NAMESPACE%"/ || microk8s kubectl apply -n %NAMESPACE% -f - || echo 'not need update docker-regcred'

# server
sudo microk8s kubectl apply -f .kubernetes/generated/server

# client
sudo microk8s kubectl apply -f .kubernetes/generated/client

# depricated
sudo microk8s kubectl delete service master-client-global --namespace master || echo 'not need delete master-client-global'
```

### 8. Commit the changes and wait for CI/CD to work successfully and check with your hands that the site http://fullstack.nestjs-mod.com:30222 It doesn't work anymore

Current site: https://fullstack.nestjs-mod.com

### Conclusion

In this project, Ingress will work simply as a proxy to our own Nginx with an embedded frontend application, and all further new microservices and applications that will be developed and that will need access from the outside will also be described in our own Nginx.

Our own Nginx with all our routing rules is needed in order to be able to deploy all applications without Kubernetes and not have to have several different Nginx configuration files.

### Plans

In the next post, I will add semantic versioning of applications that will run depending on changes in dependent files...

### Links

https://nestjs.com - the official website of the framework
https://nestjs-mod.com - the official website of additional utilities
https://fullstack.nestjs-mod.com - website from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/28ebc77b38b2b1c9945e87806e5726451b8d22a2..33b51edf67471600e583f89f10b2d99a1b9b79da - current changes

#kubernetes #github #nestjsmod #fullstack
