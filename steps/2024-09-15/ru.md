## [2024-09-15] Доступ к сайту на NestJS и Angular по доменному имени c SSL - сертификатом в Kubernetes через Ingress

Предыдущая статья: [Установка Kubernetes через MicroK8s и настройка деплоя NestJS и Angular приложений](https://habr.com/ru/articles/843332/)

В Kubernetes очень легко настраивается работа с SSL, это наверное одна из главных причин почему я и начал им пользоваться, в этой статье я опишу простой сценарий его подключения.

### 1. Установка менеджера сертификатов на выделенный сервер

Подключаемся к нашему серверу по SSH и включаем cert-manager плагин у MicroK8s.

Плагин cert-manager управляет процессом выпуска и продления SSL - сертификатов.

_Команды_

```bash
ssh root@194.226.49.162
microk8s enable cert-manager
```

_Вывод консоли_

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

### 2. Создаем в репозитории файл с параметрами ресурса для создания сертификатов

Существуют различные бесплатные и платные сайты которые выдают SSL - сертификаты, и мы можем указать в cert-manager каким образом и у кого брать эти сертификаты.

Лично я сам настраивал только получение сертификатов с https://letsencrypt.org и https://www.cloudflare.com, в данном проекте будут использоваться сертификаты от `Let's Encrypt`.

Для того чтобы указать источник для получения сертификатов нам нужно создать ресурс для создания сертификатов.

Создаем файл `.kubernetes/templates/node/8.issuer.yaml`

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

### 3. Создаем в репозитории файл с параметрами сущности Kubernetes которая отвечает за проксирование внешнего трафика в наши сервисы

По умолчанию эта сущность создается на основе Nginx, ну можно настроить и Traefik, в данном проекте будет использоваться Nginx, так как он подставляется по умолчанию.

Создаем файл `.kubernetes/templates/node/8.issuer.yaml`

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

### 4. Немного меняем CI/CD-конфигурацию для деплоя в Kubernetes, чтобы исключить лишний передеплой инфраструктуры

Пайплайн деплоя можно по разному разбивать, кому как удобно и как надо, но в текущем посте я просто запрещу перезапуск инфраструктуры если версия приложения не была изменена.

Обновленный вариант задачи по деплою приложения `.github/workflows/kubernetes.yml`

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

### 5. Меняем адрес тестируемого сайта в "Docker Compose" - файле для E2E тестов

Так как теперь мы имеем домен с SSL - сертификатом, нам больше не нужно указывать порт с глобальным сервисом фронтенд Nginx при запуске E2E - тестов.

Обновленный файл `.kubernetes/templates/docker-compose-e2e-tests.yml`

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

### 6. Коммитим изменения и ждем когда CI/CD отработает успешно и руками проверяем работу сайта

Текущий результат работы CI/CD: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10877250887
Текущий сайт: https://fullstack.nestjs-mod.com

### 7. Удаляем глобальный сервис который создавали в предыдущем посте

Теперь деплой и тестирование происходит сайта который работает через Ingress и значит сайт запущенный в виде глобального сервиса через NodePort больше нам не нужен и его можно удалить.

Удалить можно подключившись к выделенному серверу по ssh через команду `sudo microk8s kubectl delete service master-client-global --namespace master`, но желательно всегда доносить изменения через git - репозиторий, так как у нас может быть несколько стендов на которых также нужно будет еще раз запускать эту команду.

В данном проекте изменения мы донесем через git, для этого удалим файл `.kubernetes/templates/client/4.global-service.yaml` и добавим команду удаления в скрипт инсталяции приложений.

Обновляем файл `.kubernetes/templates/install.sh`

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

### 8. Коммитим изменения и ждем когда CI/CD отработает успешно и руками проверяем что сайт http://fullstack.nestjs-mod.com:30222 больше не работает

Текущий сайт: https://fullstack.nestjs-mod.com

### Заключение

В данном проекте Ingress будет работать просто как прокси до нашего собственного Nginx с встроенным фронтенд приложением и все дальнейшие новые микросервисы и приложения которые будут разрабатываться и к которым нужен будет доступ снаружи, также будут описываться в нашем собственном Nginx.

Собственный Nginx со всеми нашими правилами маршрутизации нужен для того чтобы иметь возможность развернуть все приложения без Kubernetes и не пришлось иметь несколько разных файлов с конфигурацией Nginx.

### Планы

В следующем посте я добавлю семантическое версионирование приложений которое будет запускаться в зависимости от изменений в зависимых файлах...

### Ссылки

https://nestjs.com - официальный сайт фреймворка
https://nestjs-mod.com - официальный сайт дополнительных утилит
http://fullstack.nestjs-mod.com:30222 - сайт из поста
https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/28ebc77b38b2b1c9945e87806e5726451b8d22a2..33b51edf67471600e583f89f10b2d99a1b9b79da - изменения

#kubernetes #github #nestjsmod #fullstack
