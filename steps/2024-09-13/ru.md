## [2024-09-13] Установка Kubernetes через MicroK8s и настройка деплоя NestJS и Angular приложений

Предыдущая статья: [Ускорение деплоя NestJS и Angular с помощью общественных Github-раннеров и создания промежуточных Docker-образов](https://habr.com/ru/articles/841760/)

Когда в команде нет DevOps - инженеров, но очень хочется задеплоить приложение в Kubernetes, можно легко это сделать с помощью https://microk8s.io, в данном посте я опишу как это сделать и открыть доступ к приложению на определенном порте.

### 1. Установка MicroK8s на выделенный сервер

Про MicroK8s уже много писали на хабре, в общем этот установщик Kubernetes с дополнительными плагинами для типовых задач и он позволяет без изучения и глубокого погружения в мир DevOps быстро развернуть Kubernetes.

Подключаемся к нашему серверу по SSH и устанавливаем Kubernetes.

_Команды_

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

_Вывод консоли_

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

### 2. Разрешаем доступ к хост машине из подов Kubernetes

Так как база данных будет находиться на хосте и в кубе будут только приложения, то для того чтобы приложение Kubernetes могло достучаться до хоста необходимо разрешить доступ к хост машине.

_Команды_

```bash
ssh root@194.226.49.162
microk8s enable host-access
```

_Вывод консоли_

```bash
root@vps1724252356:~# microk8s enable host-access
Infer repository core for addon host-access
Setting 10.0.1.1 as host-access
Host-access is enabled
```

### 3. Временно расшариваем дашборд Kubernetes и смотрим работает ли он вообще

После запуска команды расшаривания, необходимо перебросить порт удаленного сервера на локальный компьютер, так как дашборд это веб приложение.

После запуска мы также увидем токен для подключения, его необходимо будет ввести для авторизации в дашборд.

_Команды_

```bash
microk8s dashboard-proxy
```

_Вывод консоли_

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

_Если у вас возникли ошибки при подключении к дашборд, то попробуйте запустить команду:_

```bash
sudo microk8s.refresh-certs --cert ca.crt
```

### 4. Создаем скрипт для создания дополнительных переменных окружения

Часть переменных будет такая же как и для режима "Docker Compose", поэтому можно просто скопировать и модифицировать существующий файл `.docker/set-env.sh` в `.kubernetes/set-env.sh`.

В этом скрипте много проверок на наличие необходимых переменных и в случаи их отсутствия, вместо них используется значения по умолчанию.

Создаем файл `.kubernetes/set-env.sh`

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

### 5. Шаблоны конфигураций

Обычно для разворачивания инфраструктуры и приложений используют [Ansible](https://docs.ansible.com/) и [Helm](https://helm.sh/), в данном проекте они не используются, для того чтобы не перегружать лишней информацией.

В данном проекте для копирования и подстановки переменных окружения используется утилита https://www.npmjs.com/package/rucken, а конкретнее ее команда `copy-paste`.

Мини пример использования утилиты:

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

Вывод:

```bash
$ cat ./human-ufo/human_ufo.txt
examples:
humanUfo
human-ufos
human_ufo
```

Основные этапы запуска проекта в Kubernetes:

1. Собираем докер образы;
2. Запускаем скрипт создания дополнительных переменных окружения;
3. Копируем файлы с шаблонами конфигураций запуска приложений и инфраструктуры, при этом заменяем во всех скопированных файлах все найденные переменные окружения;
4. Запускаем инфраструктуру через "Docker Compose" (база данных + миграции);
5. Создаем и запускаем приложения в Kubernetes;
6. Запускам E2E-тесты через "Docker Compose".

### 6. Создаем "Docker Compose" - файлы для запуска базы данных, миграций и тестов

Инфраструктурные вещи наподобие базы данных или брокеров необходимо запускать на отдельных серверах, а в рамках Kubernetes запускать только наши приложения.

За каждый сервер и инфраструктурную программу могут отвечать специализированные команды DevOps - инженеров, а также меньше шансов потерять все данные, если сервер вдруг физически сломается.

База данных и миграции в этом проекте запускается через отдельный "Docker Compose" - файл, так что шаг запуска баз данных можно перенастроить на запуск в отдельном акшен ранере который будет установлен на отдельном сервере, в котором нет Kubernetes.

Создаем файл `.kubernetes/templates/docker-compose-infra.yml`

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

Запуск E2E - тестов также происходит через специальный "Docker Compose", это сделано для того чтобы можно было запустить множество параллельных Docker - контейнеров с тестами, и получим нечто похожее на нагрузочные тесты стенда, а также мы имеем возможность запускать тесты с разных регионов.

Создаем файл `.kubernetes/templates/docker-compose-e2e-tests.yml`

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

### 7. Создаем Kubernetes - файлы для настройки стенда

Создаем неймспейс стенда или текущего деплоя, все элементы приложения будут связанны с этим неймспес, и гораздо проще мониторить состояния элементов стенда.

Файл с неймспейс: `.kubernetes/templates/node/0.namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: '%NAMESPACE%'
```

Если у нас имеются некие общие переменные окружения для разных приложений задеплоенных в рамках одного Kubernetes и одного и того же нейспейса, то мы можем поместить их в глобальный конфигурационный файл стенда.

Файл конфигурации: `.kubernetes/templates/node/1.configmap.yaml`

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

### 8. Создаем Kubernetes - файлы для запуска сервера на NestJS

Помимо общих переменных окружения, каждое приложение может иметь свои переменные окружения, для таких переменных создаем конфигурационный файл приложения.

Файл конфигурации: `.kubernetes/templates/server/1.configmap.yaml`

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

Контейнер с приложением будет создаваться используя Docker - образ, который мы ранее собирали.

Установим лимиты контейнеру: общий лимит на процессор 30% и память 512 мегабайт, лимит процессора на запрос 10% и 128 мегабайт памяти.

Деплоймент файл: `.kubernetes/templates/server/3.deployment.yaml`

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

Для того чтобы другие приложения (в данном случаи Nginx с фронтендом) могли обращаться к контейнеру сервера, необходимо создать сервис.

Файл сервиса: `.kubernetes/templates/server/4.service.yaml`

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

### 9. Создаем Kubernetes - файлы для запуска Nginx c встроенным фронтенд на Angular

Файл конфигурации: `.kubernetes/templates/client/1.configmap.yaml`

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

Деплоймент файл: `.kubernetes/templates/client/3.deployment.yaml`

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

Файл сервиса: `.kubernetes/templates/client/4.service.yaml`

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

Так как в начале мы пробуем задеплоить приложение на порту без домена, то нам необходимо создать еще один сервис который расшарит порт контейнера наружу.

Файл глобального сервиса: `.kubernetes/templates/client/4.global-service.yaml`

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

### 10. Создаем баш скрипт для применения конфигураций Kubernetes

Создаем файл `.kubernetes/templates/install.sh`

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

### 11. Создаем CI/CD-конфигурацию для деплоя в Kubernetes

Часть задач будет такая же как и для режима "Docker Compose", поэтому можно просто скопировать и модифицировать существующий файл `.github/workflows/docker-compose.workflows.yml` в `.github/workflows/kubernetes.yml` и заменить задачу по деплою.

_Генерация конфигураций и применение их в Kubernetes_

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

### 12. Добавляем новое окружение

Переходим по адресу https://github.com/nestjs-mod/nestjs-mod-fullstack/settings/environments/new и добавляем окружение `kubernetes`.

### 13. Добавляем новые переменные окружения

Переходим в параметры созданного ранее окружении и поочередно добавляем все переменные в секцию `Environment secrets`, на данном этапе можно уже формировать защищенные значения для некоторых переменных.

```bash
SERVER_APP_DATABASE_NAME=app
SERVER_APP_DATABASE_PASSWORD=9UwcpRh12srXoPlTSN53ZOUc9ev9qNYg
SERVER_APP_DATABASE_USERNAME=app
SERVER_DOMAIN=fullstack.nestjs-mod.com
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=DN7DHoMWd2D13YNH116cFWeJgfVAFO9e
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
```

### 14. Подключаемся к выделенному серверу и удаляем все Docker - контейнеры

```bash
docker stop $(docker ps -a -q) || echo 'docker containers not started'
docker rm $(docker ps --filter status=exited -q) || echo 'docker containers not exists'
```

### 15. Коммитим изменения и ждем когда CI/CD отработает успешно и руками проверяем работу сайта

Текущий результат работы CI/CD: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10861775039
Текущий сайт: http://194.226.49.162:30222/

### Заключение

Когда в команде есть DevOps - инженер он обычно и занимается деплоем приложения и данный пост больше для fullstack разработчиков которым приходится не только писать код но и деплоить его на продакшен.

По хорошему при первой возможности нужно нанимать специалиста по DevOps или брать команду DevOps - инженеров на аутсорс и чтобы они реализовали все без использования bash - скриптов, а также инфраструктурные вещи нужно запускать не через "Docker Compose" а прямо на самих машинах.

DevOps - инженеры также должны поставить нормальную версию Kubernetes и настроить выпуск Helm - чартов, так как https://microk8s.io/ это больше для разработчиков.

Ну в целом описанная выше схема деплоя может работать в продакшен среде, как в режиме одной ноды так и в режиме кластера.

### Планы

В следующем посте я добавлю Ingress для организации доступа к сайту по доменному имени и генерацию SSL - сертификата...

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- http://fullstack.nestjs-mod.com:30222 - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/commit/4b1c3c7d6bcb0b3bac479d5f414bbefd49aa5e87 - изменения

#kubernetes #github #nestjsmod #fullstack
