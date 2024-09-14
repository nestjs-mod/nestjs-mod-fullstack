## [2024-09-13] Installing Kubernetes via MicroK8s and configuring the deployment of NestJS and Angular applications

When there are no DevOps engineers in the team, but you really want to embed the application in Kubernetes, you can easily do this using https://microk8s.io in this post, I will describe how to do this and open access to the application on a specific port.

### 1. Installing MicroK8s on a dedicated server

There has already been a lot written about MicroK8s on habra, in general, this Kubernetes installer with additional plugins for typical tasks and it allows you to quickly deploy Kubernetes without studying and deep diving into the world of DevOps.

We connect to our server via SSH and install Kubernetes.

_Commands_

```bash
ssh root@194.226.49.162
sudo snap install microk8s --classic
sudo usermod -a -G microk8s $USER
mkdir ~/.kube
sudo chown -R $USER ~/.kube
newgrp microk8s
# close and open terminal with ssh
microk8s status --wait-ready
microk8s enable dashboard dns registry ingress hostpath-storage
```

_Console output_

```bash
root@vps1724252356:~# sudo snap install microk8s --classic
Start snap "microk8s" (7180) services
microk8s (1.30/stable) v1.30.4 from Canonical✓ installed
root@vps1724252356:~# sudo usermod -a -G microk8s $USER
root@vps1724252356:~# mkdir ~/.kube
root@vps1724252356:~# sudo chown -R $USER ~/.kube
root@vps1724252356:~# newgrp microk8s
# close and open terminal with ssh
root@vps1724252356:~# microk8s status --wait-ready
microk8s is running
high-availability: no
  datastore master nodes: 127.0.0.1:19001
  datastore standby nodes: none
addons:
  enabled:
    dns                  # (core) CoreDNS
    ha-cluster           # (core) Configure high availability on the current node
    helm                 # (core) Helm - the package manager for Kubernetes
    helm3                # (core) Helm 3 - the package manager for Kubernetes
  disabled:
    cert-manager         # (core) Cloud native certificate management
    cis-hardening        # (core) Apply CIS K8s hardening
    community            # (core) The community addons repository
    dashboard            # (core) The Kubernetes dashboard
    gpu                  # (core) Alias to nvidia add-on
    host-access          # (core) Allow Pods connecting to Host services smoothly
    hostpath-storage     # (core) Storage class; allocates storage from host directory
    ingress              # (core) Ingress controller for external access
    kube-ovn             # (core) An advanced network fabric for Kubernetes
    mayastor             # (core) OpenEBS MayaStor
    metallb              # (core) Loadbalancer for your Kubernetes cluster
    metrics-server       # (core) K8s Metrics Server for API access to service metrics
    minio                # (core) MinIO object storage
    nvidia               # (core) NVIDIA hardware (GPU and network) support
    observability        # (core) A lightweight observability stack for logs, traces and metrics
    prometheus           # (core) Prometheus operator for monitoring and logging
    rbac                 # (core) Role-Based Access Control for authorisation
    registry             # (core) Private image registry exposed on localhost:32000
    rook-ceph            # (core) Distributed Ceph storage using Rook
    storage              # (core) Alias to hostpath-storage add-on, deprecated
root@vps1724252356:~# microk8s enable dashboard dns registry ingress hostpath-storage
Infer repository core for addon dashboard
Infer repository core for addon dns
Infer repository core for addon registry
Infer repository core for addon ingress
Infer repository core for addon hostpath-storage
WARNING: Do not enable or disable multiple addons in one command.
         This form of chained operations on addons will be DEPRECATED in the future.
         Please, enable one addon at a time: 'microk8s enable <addon>'
Enabling Kubernetes Dashboard
Infer repository core for addon metrics-server
Addon core/metrics-server is already enabled
Applying manifest
serviceaccount/kubernetes-dashboard created
service/kubernetes-dashboard created
secret/kubernetes-dashboard-certs created
secret/kubernetes-dashboard-csrf created
secret/kubernetes-dashboard-key-holder created
configmap/kubernetes-dashboard-settings created
role.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrole.rbac.authorization.k8s.io/kubernetes-dashboard created
rolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
deployment.apps/kubernetes-dashboard created
service/dashboard-metrics-scraper created
deployment.apps/dashboard-metrics-scraper created
secret/microk8s-dashboard-token unchanged

If RBAC is not enabled access the dashboard using the token retrieved with:

microk8s kubectl describe secret -n kube-system microk8s-dashboard-token

Use this token in the https login UI of the kubernetes-dashboard service.

In an RBAC enabled setup (microk8s enable RBAC) you need to create a user with restricted
permissions as shown in:
https://github.com/kubernetes/dashboard/blob/master/docs/user/access-control/creating-sample-user.md

Enabling DNS
Using host configuration from /run/systemd/resolve/resolv.conf
Applying manifest
serviceaccount/coredns created
configmap/coredns created
deployment.apps/coredns created
service/kube-dns created
clusterrole.rbac.authorization.k8s.io/coredns created
clusterrolebinding.rbac.authorization.k8s.io/coredns created
CoreDNS service deployed with IP address 10.152.183.10
Restarting kubelet
DNS is enabled
Infer repository core for addon hostpath-storage
Addon core/hostpath-storage is already enabled
The registry will be created with the size of 20Gi.
Default storage class will be used.
namespace/container-registry created
persistentvolumeclaim/registry-claim created
deployment.apps/registry created
service/registry created
configmap/local-registry-hosting configured
Enabling Ingress
ingressclass.networking.k8s.io/public created
ingressclass.networking.k8s.io/nginx created
namespace/ingress created
serviceaccount/nginx-ingress-microk8s-serviceaccount created
clusterrole.rbac.authorization.k8s.io/nginx-ingress-microk8s-clusterrole created
role.rbac.authorization.k8s.io/nginx-ingress-microk8s-role created
clusterrolebinding.rbac.authorization.k8s.io/nginx-ingress-microk8s created
rolebinding.rbac.authorization.k8s.io/nginx-ingress-microk8s created
configmap/nginx-load-balancer-microk8s-conf created
configmap/nginx-ingress-tcp-microk8s-conf created
configmap/nginx-ingress-udp-microk8s-conf created
daemonset.apps/nginx-ingress-microk8s-controller created
Ingress is enabled
Addon core/hostpath-storage is already enabled
```

### 2. We allow access to the host machine from Pods Kubernetes

Since the database will be located on the host and there will only be applications in Kubernetes, in order for the Kubernetes application to reach the host, it is necessary to allow access to the host machine.

_Commands_

```bash
ssh root@194.226.49.162
microk8s enable host-access
```

_Console output_

```bash
root@vps1724252356:~# microk8s enable host-access
Infer repository core for addon host-access
Setting 10.0.1.1 as host-access
Host-access is enabled
```

### 3. Temporarily share the Kubernetes dashboard and see if it works at all

After running the sharing command, it is necessary to transfer the port of the remote server to the local computer, since the dashboard is a web application.

After the launch, we will also see a token for connection, it will need to be entered to log in to the dashboard.

_Commands_

```bash
microk8s dashboard-proxy
```

_Console output_

```bash
root@vps1724252356:~# microk8s dashboard-proxy
Checking if Dashboard is running.
Infer repository core for addon dashboard
Waiting for Dashboard to come up.
Trying to get token from microk8s-dashboard-token
Waiting for secret token (attempt 0)
Dashboard will be available at https://127.0.0.1:10443
Use the following token to login:
SOME_RANDOM_SYMBOLS
```

_If you have any errors when connecting to the dashboard, then try running the command:_

```bash
sudo microk8s.refresh-certs --cert ca.crt
```

### 4. Creating a script to create additional environment variables

Some of the variables will be the same as for the "Docker Compose" mode, so you can simply copy and modify an existing `.docker/set-env.sh` to `.kubernetes/set-env.sh`.

There are a lot of checks in this script for the presence of necessary variables and in cases of their absence, default values are used instead.

Creating a file `.kubernetes/set-env.sh `

```bash
#!/bin/bash
set -e

export REPOSITORY=nestjs-mod/nestjs-mod-fullstack
export REGISTRY=ghcr.io
export BASE_SERVER_IMAGE_NAME="${REPOSITORY}-base-server"
export BUILDER_IMAGE_NAME="${REPOSITORY}-builder"
export MIGRATIONS_IMAGE_NAME="${REPOSITORY}-migrations"
export SERVER_IMAGE_NAME="${REPOSITORY}-server"
export NGINX_IMAGE_NAME="${REPOSITORY}-nginx"
export E2E_TESTS_IMAGE_NAME="${REPOSITORY}-e2e-tests"
export COMPOSE_INTERACTIVE_NO_CLI=1
export NX_DAEMON=false
export NX_PARALLEL=1
export NX_SKIP_NX_CACHE=true
export DISABLE_SERVE_STATIC=true

export ROOT_VERSION=$(npm pkg get version --workspaces=false | tr -d \")
export SERVER_VERSION=$(cd ./apps/server && npm pkg get version --workspaces=false | tr -d \")

# node
if [ -z "${NAMESPACE}" ]; then
    export NAMESPACE=master
fi

# common
if [ -z "${SERVER_DOMAIN}" ]; then
    export SERVER_DOMAIN=example.com
fi

# server
if [ -z "${SERVER_PORT}" ]; then
    export SERVER_PORT=9191
fi
if [ -z "${SERVER_APP_DATABASE_PASSWORD}" ]; then
    export SERVER_APP_DATABASE_PASSWORD=app_password
fi
if [ -z "${SERVER_APP_DATABASE_USERNAME}" ]; then
    export SERVER_APP_DATABASE_USERNAME=${NAMESPACE}_app
fi
if [ -z "${SERVER_APP_DATABASE_NAME}" ]; then
    export SERVER_APP_DATABASE_NAME=${NAMESPACE}_app
fi

# client
if [ -z "${NGINX_PORT}" ]; then
    export NGINX_PORT=8181
fi

# database
if [ -z "${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}" ]; then
    export SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
fi
if [ -z "${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}" ]; then
    export SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
fi
if [ -z "${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}" ]; then
    export SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
fi
```

### 5. Configuration Templates

Usually [Ansible](https://docs.ansible.com/) and [Helm](https://helm.sh/) are used to deploy infrastructure and applications, they are not used in this project in order not to overload with unnecessary information.

In this project, a utility is used to copy and replace environment variables https://www.npmjs.com/package/rucken , and more specifically, its `copy-paste` command.

A mini example of using the utility:

```bash
mkdir cat-dog
echo "%START_ENV_VARIABLE%
catDog
cat-dogs
cat_dog" > cat-dog/cat_dog.txt
export START_ENV_VARIABLE="examples:"
npx -y rucken@latest copy-paste --find=cat-dog --replace=human-ufo --path=./cat-dog --replace-envs=true
cat ./human-ufo/human_ufo.txt
```

Output:

```bash
$ cat ./human-ufo/human_ufo.txt
examples:
humanUfo
human-ufos
human_ufo
```

The main stages of the project launch in Kubernetes:

1. Collecting docker images;
2. Run the script for creating additional environment variables;
3. Copy the files with the application launch and infrastructure configuration templates, while replacing all the environment variables found in all copied files;
4. We launch the infrastructure through "Docker Compose" (database + migrations);
5. Create and run applications in Kubernetes;
6. Running E2E tests via "Docker Compose"..

### 6. Creating "Docker Compose" files to run the database, migrations and tests

Infrastructure things like the broker or database need to be run on separate servers, and within Kubernetes, only our applications need to be run.

Specialized teams of DevOps engineers can be responsible for each server and infrastructure program, and there is also less chance of losing all data if the server suddenly physically breaks down.

The database and migrations in this project are launched through a separate "Docker Compose" file, so that the database startup step can be reconfigured to run in a separate action runner that will be installed on a separate server that does not have Kubernetes.

Creating a file `.kubernetes/templates/docker-compose-infra.yml`

```yaml
version: '3'
networks:
  nestjs-mod-fullstack-network:
    driver: 'bridge'
services:
  nestjs-mod-fullstack-postgre-sql:
    image: 'bitnami/postgresql:15.5.0'
    container_name: 'nestjs-mod-fullstack-postgre-sql'
    networks:
      - 'nestjs-mod-fullstack-network'
    ports:
      - '5432:5432'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'pg_isready -U postgres'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
    environment:
      POSTGRESQL_USERNAME: '%SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME%'
      POSTGRESQL_PASSWORD: '%SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD%'
      POSTGRESQL_DATABASE: '%SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE%'
    volumes:
      - 'nestjs-mod-fullstack-postgre-sql-volume:/bitnami/postgresql'
  nestjs-mod-fullstack-postgre-sql-migrations:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-migrations:%ROOT_VERSION%'
    container_name: 'nestjs-mod-fullstack-postgre-sql-migrations'
    networks:
      - 'nestjs-mod-fullstack-network'
    tty: true
    environment:
      NX_SKIP_NX_CACHE: 'true'
      SERVER_ROOT_DATABASE_URL: 'postgres://%SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME%:%SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD%@nestjs-mod-fullstack-postgre-sql:5432/%SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE%?schema=public'
      SERVER_APP_DATABASE_URL: 'postgres://%SERVER_APP_DATABASE_USERNAME%:%SERVER_APP_DATABASE_PASSWORD%@nestjs-mod-fullstack-postgre-sql:5432/%SERVER_APP_DATABASE_NAME%?schema=public'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: 'service_healthy'
    working_dir: '/usr/src/app'
    volumes:
      - './../../apps:/usr/src/app/apps'
      - './../../libs:/usr/src/app/libs'
volumes:
  nestjs-mod-fullstack-postgre-sql-volume:
    external: true
    name: 'nestjs-mod-fullstack-postgre-sql-volume'
```

The launch of E2E tests also takes place through a special "Docker Compose", this is done so that you can run many parallel Docker containers with tests, and we will get something similar to the load tests of the stand, and we also have the opportunity to run tests from different regions.

Creating a file `.kubernetes/templates/docker-compose-e2e-tests.yml`

```yaml
version: '3'
networks:
  nestjs-mod-fullstack-network:
    driver: 'bridge'
services:
  nestjs-mod-fullstack-e2e-tests:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-e2e-tests:%ROOT_VERSION%'
    container_name: 'nestjs-mod-fullstack-e2e-tests'
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      BASE_URL: 'http://host.docker.internal:30222'
    working_dir: '/usr/src/app'
    volumes:
      - './../../apps:/usr/src/app/apps'
      - './../../libs:/usr/src/app/libs'
```

### 7. Creating Kubernetes files for configuring the stand

We create a namespace of the stand or the current deployment, all the elements of the application will be associated with this namespace, and it is much easier to monitor the status of the elements of the stand.

Name space file: `.kubernetes/templates/node/0.namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: '%NAMESPACE%'
```

If we have some common environment variables for different applications embedded within the same Kubernetes and the same workspace, then we can put them in the global configuration file of the stand.

Configuration file: `.kubernetes/templates/node/1.configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-config
data:
  DEBUG: 'true'
  BITNAMI_DEBUG: 'true'
```

### 8. Creating Kubernetes files to run the server on NestJS

In addition to common environment variables, each application can have its own environment variables, for such variables we create an application configuration file.

Configuration file: `.kubernetes/templates/server/1.configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-server-config
data:
  NODE_TLS_REJECT_UNAUTHORIZED: '0'
  SERVER_APP_DATABASE_URL: 'postgres://%SERVER_APP_DATABASE_USERNAME%:%SERVER_APP_DATABASE_PASSWORD%@10.0.1.1:5432/%SERVER_APP_DATABASE_NAME%?schema=public'
  SERVER_PORT: '%SERVER_PORT%'
```

The container with the application will be created using the Docker image that we previously collected.

Let's set limits for the container: the total limit for the processor is 30% and memory is 512 megabytes, the processor limit for the request is 10% and 128 megabytes of memory.

The deployment file: `.kubernetes/templates/server/3.deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-server
spec:
  replicas: 1
  selector:
    matchLabels:
      pod: %NAMESPACE%-server-container
  template:
    metadata:
      namespace: '%NAMESPACE%'
      labels:
        app: %NAMESPACE%-server
        pod: %NAMESPACE%-server-container
    spec:
      containers:
        - name: %NAMESPACE%-server
          image: ghcr.io/nestjs-mod/nestjs-mod-fullstack-server:%SERVER_VERSION%
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: %SERVER_PORT%
          envFrom:
            - configMapRef:
                name: %NAMESPACE%-config
            - configMapRef:
                name: %NAMESPACE%-server-config
          resources:
            requests:
              memory: 128Mi
              cpu: 100m
            limits:
              memory: 512Mi
              cpu: 300m
      imagePullSecrets:
        - name: docker-regcred
```

In order for other applications (in this case Nginx with a frontend) to access the server container, you need to create a service.

The service file: `.kubernetes/templates/server/4.service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-server
  labels:
    app: %NAMESPACE%-server
spec:
  selector:
    app: %NAMESPACE%-server
  ports:
    - name: '%SERVER_PORT%'
      protocol: TCP
      port: %SERVER_PORT%
      targetPort: %SERVER_PORT%
  type: ClusterIP
```

### 9. Creating Kubernetes files to run Nginx with a built-in frontend on Angular

Configuration file: `.kubernetes/templates/client/1.configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-client-config
data:
  SERVER_PORT: '%SERVER_PORT%'
  NGINX_PORT: '%NGINX_PORT%'
  SERVER_NAME: %NAMESPACE%-server.%NAMESPACE%
```

The deployment file: `.kubernetes/templates/client/3.deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-client
spec:
  replicas: 1
  selector:
    matchLabels:
      pod: %NAMESPACE%-client-container
  template:
    metadata:
      namespace: '%NAMESPACE%'
      labels:
        app: %NAMESPACE%-client
        pod: %NAMESPACE%-client-container
    spec:
      containers:
        - name: %NAMESPACE%-client
          image: ghcr.io/nestjs-mod/nestjs-mod-fullstack-nginx:%SERVER_VERSION%
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: %NGINX_PORT%
          envFrom:
            - configMapRef:
                name: %NAMESPACE%-config
            - configMapRef:
                name: %NAMESPACE%-client-config
          resources:
            requests:
              memory: 128Mi
              cpu: 100m
            limits:
              memory: 512Mi
              cpu: 300m
      imagePullSecrets:
        - name: docker-regcred
```

The service file: `.kubernetes/templates/client/4.service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-client
  labels:
    app: %NAMESPACE%-client
spec:
  selector:
    app: %NAMESPACE%-client
  ports:
    - name: '%NGINX_PORT%'
      protocol: TCP
      port: %NGINX_PORT%
      targetPort: %NGINX_PORT%
  type: ClusterIP
```

Since at the beginning we are trying to deploy the application on a certain port without a domain, we need to create another service that will share the container port outside.

Global Service File: `.kubernetes/templates/client/4.global-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: '%NAMESPACE%'
  name: %NAMESPACE%-client-global
  labels:
    app: %NAMESPACE%-client-global
spec:
  selector:
    app: %NAMESPACE%-client
  ports:
    - port: 30222
      nodePort: 30222
      targetPort: %NGINX_PORT%
  type: NodePort
```

### 10. Creating a bash script for applying Kubernetes configurations

Creating a file `.kubernetes/templates/install.sh`

```bash
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

```

### 11. Creating a CI/CD configuration for deployment in Kubernetes

Some of the tasks will be the same as for the "Docker Compose" mode, so you can simply copy and modify the existing file `.github/workflows/docker-compose.workflows.yml`in `.github/workflows/kubernetes.yml` and replace the deployment task.

_Generation of configurations and their application in Kubernetes_

```yaml
# ...
jobs:
  # ...
  deploy:
    environment: kubernetes
    needs: [build-and-push-migrations-image, build-and-push-server-image, build-and-push-nginx-image, build-and-push-e2e-tests-image]
    runs-on: [self-hosted]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          # We must fetch at least the immediate parents so that if this is
          # a pull request then we can checkout the head.
          fetch-depth: 2

      - name: Deploy
        env:
          DOCKER_SERVER: ${{ env.REGISTRY }}
          DOCKER_USERNAME: ${{ github.actor }}
          DOCKER_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
          SERVER_APP_DATABASE_NAME: ${{ secrets.SERVER_APP_DATABASE_NAME }}
          SERVER_APP_DATABASE_PASSWORD: ${{ secrets.SERVER_APP_DATABASE_PASSWORD }}
          SERVER_APP_DATABASE_USERNAME: ${{ secrets.SERVER_APP_DATABASE_USERNAME }}
          SERVER_DOMAIN: ${{ secrets.SERVER_DOMAIN }}
          SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE: ${{ secrets.SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE }}
          SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD: ${{ secrets.SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD }}
          SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME: ${{ secrets.SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME }}
        run: |
          rm -rf ./.kubernetes/generated
          . .kubernetes/set-env.sh && npx -y rucken copy-paste --find=templates --replace=generated --replace-plural=generated --path=./.kubernetes/templates --replace-envs=true
          chmod +x .kubernetes/generated/install.sh
          docker compose -f ./.kubernetes/generated/docker-compose-infra.yml --compatibility down || echo 'docker-compose-infra not started'
          docker compose -f ./.kubernetes/generated/docker-compose-e2e-tests.yml --compatibility down || echo 'docker-compose-e2e-tests not started'
          docker compose -f ./.kubernetes/generated/docker-compose-infra.yml --compatibility up -d
          .kubernetes/generated/install.sh > /dev/null 2>&1 &
          docker compose -f ./.kubernetes/generated/docker-compose-e2e-tests.yml --compatibility up
```

### 12. Adding a new environment

Go to the address https://github.com/nestjs-mod/nestjs-mod-fullstack/settings/environments/new and add the `kubernetes` environment.

### 13. Adding new environment variables

Go to the parameters of the previously created environment and alternately add all the variables to the `Environment secrets` section, at this stage you can already generate protected values for some variables.

```bash
SERVER_APP_DATABASE_NAME=app
SERVER_APP_DATABASE_PASSWORD=9UwcpRh12srXoPlTSN53ZOUc9ev9qNYg
SERVER_APP_DATABASE_USERNAME=app
SERVER_DOMAIN=fullstack.nestjs-mod.com
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=DN7DHoMWd2D13YNH116cFWeJgfVAFO9e
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
```

### 14. We connect to a dedicated server and delete all Docker containers

```bash
docker stop $(docker ps -a -q) || echo 'docker containers not started'
docker rm $(docker ps --filter status=exited -q) || echo 'docker containers not exists'
```

### 15. We commit the changes and wait for CI/CD to work successfully and check the site operation with our hands

Текущий результат работы CI/CD: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10861775039
Текущий сайт: http://194.226.49.162:30222/

### Conclusion

When there is a DevOps engineer in the team, he usually deals with the deployment of the application and this post is more for full stack developers who have to not only write code but also deploy it to production.

In a good way, at the first opportunity, you need to hire a DevOps specialist or take a team of DevOps engineers to outsource and so that they implement everything without using bash scripts, as well as infrastructure things need to be run not through Docker Compose, but directly on the machines themselves.

DevOps engineers should also install a normal version of Kubernetes and set up the release of Helm charts, since https://microk8s.io / this is more for developers.

Well, in general, the deployment scheme described above can work in a production environment, both in single node mode and in cluster mode.

### Plans

In the next post, I will add Ingress to organize access to the site by domain name and generate an SSL certificate...

### Links

https://nestjs.com - the official website of the framework
https://nestjs-mod.com - the official website of additional utilities
http://fullstack.nestjs-mod.com:30222 - website from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack/commit/4b1c3c7d6bcb0b3bac479d5f414bbefd49aa5e87 - current changes

#kubernetes #github #nestjsmod #fullstack
