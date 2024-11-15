## [2024-08-22] Ручной деплой NestJS и Angular приложений на выделенном сервер через "Docker Compose" и "PM2".

Предыдущая статья: [Сборка приложений на NestJS и Angular и запуск их в двух вариантах: через PM2 и через "Docker Compose"](https://habr.com/ru/articles/838830/)

Покупаем выделенный сервер и настраиваем SSH доступ к нему с локального компьютера.

Добавляем https://github.com/SteveLTN/https-portal в "Docker compose" для автоматической генерации и продления сертификатов.

### 1. Находим бесплатный или покупаем выделенный сервер

Шаги по этому пункту не буду расписывать, я уже расписывал ранее в разделе "Buy VPS" другого поста - [Deploy nestjs project to VPS with dokku](https://dev.to/endykaufman/deploy-nestjs-project-to-vps-with-dokku-31c5).

В рамках текущих постов я купил на том же сайте самый дешевый выделенный сервер.

_Операционная система_: `Ubuntu 22.04 x64`
_Доступ в мир_: `100 MB/sec (shared)`
_RAM_: `2GB`
_CPU_: `2 vCPU`
_Количество IPv4 адресов_: `1`

При покупке выделенного сервера мне также дали домен третьего уровня: vps1724252356.tech0.ru, в будущем этот проект переедет на домен https://fullstack.nestjs-mod.com.

### 2. Настройка подключение к выделенному серверу по SSH

После покупки необходимо установить пароль если он не был установлен, разные сайты имеют свои интерфейсы для этого, в моем случаи установка пароля находится на странице https://ztv.su/clientarea.php?action=productdetails&id=33376#tabChangepw.

Копируем наш локальный публичный SSH на удаленный сервер, при запуске появится запрос на ввод пароля, необходимо ввести свой пароль и нажать "Enter".

Если SSH-ключа на компьютере не было, то его нужно создать с помощью команды `ssh-keygen`

_Команды_

```bash
ssh-copy-id root@194.226.49.162
```

<spoiler title="Вывод консоли">

```bash
$ ssh-copy-id root@194.226.49.162
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/user/.ssh/id_rsa.pub"
The authenticity of host '194.226.49.162 (194.226.49.162)' can't be established.
ECDSA key fingerprint is SHA256:SOME_SYMBOLS.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
root@194.226.49.162's password:

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'root@194.226.49.162'"
and check to make sure that only the key(s) you wanted were added.
```

</spoiler>

### 3. Подключение к удаленному серверу

_Команды_

```bash
ssh root@194.226.49.162
```

<spoiler title="Вывод консоли">

```bash
$ ssh root@194.226.49.162
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Wed Aug 21 18:42:37 MSK 2024

  System load:  0.02734375        Processes:             103
  Usage of /:   9.4% of 24.05GB   Users logged in:       0
  Memory usage: 10%               IPv4 address for eth0: 194.226.49.162
  Swap usage:   0%

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Wed Aug 21 18:41:46 2024 from X.X.X.X
root@vps1724252356:~#
```

</spoiler>

### 4. Установка всех необходимых пакетов на выделенный сервер

_Команды_

```bash
sudo snap install curl

curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo groupadd docker
sudo usermod -aG docker $USER

sudo apt install git -y

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" --no-use
nvm install v20
nvm use v20

npm install --global yarn

sudo apt install default-jre -y

sudo apt install -y unzip

echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

sudo reboot
```

<spoiler title="Вывод консоли">

```bash
root@vps1724252356:~# sudo snap install curl
curl 8.1.2 from Wouter van Bommel (woutervb) installed

root@vps1724252356:~# curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo groupadd docker
sudo usermod -aG docker $USER
# Executing docker install script, commit: 0d6f72e671ba87f7aa4c6991646a1a5b9f9dae84
+ sh -c apt-get update -qq >/dev/null
+ sh -c DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ca-certificates curl >/dev/null
+ sh -c install -m 0755 -d /etc/apt/keyrings
+ sh -c curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" -o /etc/apt/keyrings/docker.asc
+ sh -c chmod a+r /etc/apt/keyrings/docker.asc
+ sh -c echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu jammy stable" > /etc/apt/sources.list.d/docker.list
+ sh -c apt-get update -qq >/dev/null
+ sh -c DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-ce-rootless-extras docker-buildx-plugin >/dev/null
+ sh -c docker version
Client: Docker Engine - Community
 Version:           27.1.2
 API version:       1.46
 Go version:        go1.21.13
 Git commit:        d01f264
 Built:             Mon Aug 12 11:50:12 2024
 OS/Arch:           linux/amd64
 Context:           default

Server: Docker Engine - Community
 Engine:
  Version:          27.1.2
  API version:      1.46 (minimum version 1.24)
  Go version:       go1.21.13
  Git commit:       f9522e5
  Built:            Mon Aug 12 11:50:12 2024
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.7.20
  GitCommit:        8fc6bcff51318944179630522a095cc9dbf9f353
 runc:
  Version:          1.1.13
  GitCommit:        v1.1.13-0-g58aa920
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0

================================================================================

To run Docker as a non-privileged user, consider setting up the
Docker daemon in rootless mode for your user:

    dockerd-rootless-setuptool.sh install

Visit https://docs.docker.com/go/rootless/ to learn about rootless mode.


To run the Docker daemon as a fully privileged service, but granting non-root
users access, refer to https://docs.docker.com/go/daemon-access/

WARNING: Access to the remote API on a privileged Docker daemon is equivalent
         to root access on the host. Refer to the 'Docker daemon attack surface'
         documentation for details: https://docs.docker.com/go/attack-surface/

================================================================================

groupadd: group 'docker' already exists

root@vps1724252356:~# sudo apt install git -y
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
Suggested packages:
  git-daemon-run | git-daemon-sysvinit git-doc git-email git-gui gitk gitweb git-cvs git-mediawiki git-svn
The following packages will be upgraded:
  git
1 upgraded, 0 newly installed, 0 to remove and 137 not upgraded.
Need to get 3165 kB of archives.
After this operation, 16.4 kB of additional disk space will be used.
Get:1 http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 git amd64 1:2.34.1-1ubuntu1.11 [3165 kB]
Fetched 3165 kB in 1s (2408 kB/s)
(Reading database ... 94596 files and directories currently installed.)
Preparing to unpack .../git_1%3a2.34.1-1ubuntu1.11_amd64.deb ...
Unpacking git (1:2.34.1-1ubuntu1.11) over (1:2.34.1-1ubuntu1.10) ...
Setting up git (1:2.34.1-1ubuntu1.11) ...
Scanning processes...
Scanning linux images...

Running kernel seems to be up-to-date.

No services need to be restarted.

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.

root@vps1724252356:~# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" --no-use
nvm install v20
nvm use v20
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 15037  100 15037    0     0  36871      0 --:--:-- --:--:-- --:--:-- 36945
=> Downloading nvm from git to '/root/.nvm'
=> Cloning into '/root/.nvm'...
remote: Enumerating objects: 376, done.
remote: Counting objects: 100% (376/376), done.
remote: Compressing objects: 100% (320/320), done.
remote: Total 376 (delta 46), reused 176 (delta 29), pack-reused 0 (from 0)
Receiving objects: 100% (376/376), 372.57 KiB | 2.13 MiB/s, done.
Resolving deltas: 100% (46/46), done.
* (HEAD detached at FETCH_HEAD)
  master
=> Compressing and cleaning up git repository

=> Appending nvm source string to /root/.bashrc
=> Appending bash_completion source string to /root/.bashrc
=> Close and reopen your terminal to start using nvm or run the following to use it now:

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
Downloading and installing node v20.16.0...
Downloading https://nodejs.org/dist/v20.16.0/node-v20.16.0-linux-x64.tar.xz...
################################################################################################################################################################ 100.0%
Computing checksum with sha256sum
Checksums matched!
Now using node v20.16.0 (npm v10.8.1)
Creating default alias: default -> v20 (-> v20.16.0)
Now using node v20.16.0 (npm v10.8.1)

root@vps1724252356:~# npm install --global yarn

added 1 package in 2s
npm notice
npm notice New patch version of npm available! 10.8.1 -> 10.8.2
npm notice Changelog: https://github.com/npm/cli/releases/tag/v10.8.2
npm notice To update run: npm install -g npm@10.8.2
npm notice

root@vps1724252356:~# sudo apt install -y unzip
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
Suggested packages:
  zip
The following NEW packages will be installed:
  unzip
0 upgraded, 1 newly installed, 0 to remove and 137 not upgraded.
Need to get 175 kB of archives.
After this operation, 386 kB of additional disk space will be used.
Get:1 http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 unzip amd64 6.0-26ubuntu3.2 [175 kB]
Fetched 175 kB in 0s (485 kB/s)
Selecting previously unselected package unzip.
(Reading database ... 96234 files and directories currently installed.)
Preparing to unpack .../unzip_6.0-26ubuntu3.2_amd64.deb ...
Unpacking unzip (6.0-26ubuntu3.2) ...
Setting up unzip (6.0-26ubuntu3.2) ...
Processing triggers for man-db (2.10.2-1) ...
Scanning processes...
Scanning linux images...

Running kernel seems to be up-to-date.

No services need to be restarted.

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.

root@vps1724252356:~# sudo reboot
Connection to 194.226.49.162 closed by remote host.
Connection to 194.226.49.162 closed.
```

</spoiler>

### 5. Генерация SSH-ключа на выделенном сервере

Это нужно для того чтобы мы могли скачать репозиторий на выделенный сервер

_Команды_

```bash
ssh-keygen
```

<spoiler title="Вывод консоли">

```bash
root@vps1724252356:~# ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /root/.ssh/id_rsa
Your public key has been saved in /root/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:SOME_RANDOM_SYMBOLS root@vps1724252356
The key's randomart image is:
+---[RSA 3072]----+
|  .o*oo.         |
+----[SHA256]-----+
```

</spoiler>

### 6. Привязка публичного ключа выдленного сервера к GitHub

Необходимо запустить команды `cat /root/.ssh/id_rsa.pub` и ответ вставить в настройки проекта, у меня они тут: https://github.com/nestjs-mod/nestjs-mod-fullstack/settings/keys/new

_Команды_

```bash
root@vps1724252356:~# cat /root/.ssh/id_rsa.pub
```

<spoiler title="Вывод консоли">

```bash
# cat /root/.ssh/id_rsa.pub
ssh-rsa AAAARANDOM_SYMBOLS= root@vps1724252356
```

</spoiler>

### 7. Клонируем проект

_Команды_

```bash
git clone git@github.com:nestjs-mod/nestjs-mod-fullstack.git
cd nestjs-mod-fullstack
```

<spoiler title="Вывод консоли">

```bash
root@vps1724252356:~# git clone git@github.com:nestjs-mod/nestjs-mod-fullstack.git
Cloning into 'nestjs-mod-fullstack'...
The authenticity of host 'github.com (140.82.121.3)' can't be established.
ED25519 key fingerprint is SHA256:+SOME_RANDOM_SYMBOLS.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
remote: Enumerating objects: 426, done.
remote: Counting objects: 100% (426/426), done.
remote: Compressing objects: 100% (294/294), done.
remote: Total 426 (delta 190), reused 340 (delta 106), pack-reused 0 (from 0)
Receiving objects: 100% (426/426), 536.69 KiB | 1.56 MiB/s, done.
Resolving deltas: 100% (190/190), done.

root@vps1724252356:~# cd nestjs-mod-fullstack
root@vps1724252356:~/nestjs-mod-fullstack#
```

</spoiler>

### 8. Устанавливаем зависимости и прогоняем запуск и тестирование двух режимов: PM2-продакшен и "Docker Compose"

E2E-тесты запускаем указывая внешний глобальный ИП адрес приложений.

_Команды_

```bash
npm i
npx playwright install
npx playwright install-deps

npm run test

cp example.env .env
npm run pm2-full:prod:start
export BASE_URL=http://194.226.49.162:3000 && npm run test:e2e
npm run pm2-full:prod:stop

npm run docker-compose-full:prod:start
export BASE_URL=http://194.226.49.162:8080 && npm run test:e2e
npm run docker-compose-full:prod:stop
```

E2E-тестирование в режиме "Docker Compose" упало с ошибкой, в следующих шагах будем их исправлять на локальном компьютере и затем через коммит в репозиторий проекта, донесем их на выделенный сервер.

### 9. На локальном компьютере, обновляем и добавляем новые npm-скрипты

При локальной разработке для запуска использовался отдельно установленное приложение "docker-compose", а на выделенном сервере используется compose встроенный в Docker.

Удаляем скрипт для копирования статики `copy-front-to-backend`, так как теперь мы напрямую из бэкенд-приложения идем смотреть собранную статику фронтенда.

Для создания баз данных и применения миграций создаем отдельный npm-скрипт, так как при попытке запуска двух npm комманд внутри контейнера, запускался только один.

Обновляем файл `package.json`

```json
{
  "scripts": {
    // ...
    "_____docker-compose-full prod infra_____": "_____docker-compose-full prod infra_____",
    "docker-compose-full:prod:start": "export NX_DAEMON=false && export DISABLE_SERVE_STATIC=true && npm run generate && npm run build -- -c production && npm run docker:build:server:latest && export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility up -d",
    "docker-compose-full:prod:stop": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility down",
    "docker-compose-full:prod:only-start": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility up -d",
    "docker-compose-full:prod:fill:database": "npm run db:create && npm run flyway:migrate",
    // ...
    "_____docker-compose prod-infra_____": "_____docker-compose prod-infra_____",
    "docker-compose:start-prod:server": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d",
    "docker-compose:stop-prod:server": "export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env down"
  }
}
```

### 10. На локальном компьютере, обновляем параметры контейнера с миграциями в "Docker Compose" - файле

Обновленный файл `.docker/docker-compose-full.yml`

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
    volumes:
      - 'nestjs-mod-fullstack-postgre-sql-volume:/bitnami/postgresql'
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
      POSTGRESQL_USERNAME: '${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}'
      POSTGRESQL_PASSWORD: '${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}'
      POSTGRESQL_DATABASE: '${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}'
  nestjs-mod-fullstack-postgre-sql-migrations:
    image: 'node:20-bullseye-slim'
    container_name: 'nestjs-mod-fullstack-postgre-sql-migrations'
    networks:
      - 'nestjs-mod-fullstack-network'
    working_dir: '/app'
    volumes:
      - './../:/app'
    command: 'npm run docker-compose-full:prod:fill:database'
    tty: true
    environment:
      NX_SKIP_NX_CACHE: 'true'
      SERVER_ROOT_DATABASE_URL: '${SERVER_ROOT_DATABASE_URL}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: 'service_healthy'
  nestjs-mod-fullstack-server:
    image: 'nestjs-mod-fullstack-server:latest'
    container_name: 'nestjs-mod-fullstack-server'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'npx -y wait-on --timeout= --interval=1000 --window --verbose --log http://localhost:8080/api/health']
      interval: 30s
      timeout: 10s
      retries: 10
    tty: true
    environment:
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-nginx:
    image: nginx:alpine
    container_name: 'nestjs-mod-fullstack-nginx'
    networks:
      - 'nestjs-mod-fullstack-network'
    volumes:
      - ../.docker/nginx:/etc/nginx/conf.d
      - ../dist/apps/client/browser:/usr/share/nginx/html
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-server:
        condition: service_healthy
    ports:
      - '8080:8080'
  nestjs-mod-fullstack-https-portal:
    image: steveltn/https-portal:1
    container_name: 'nestjs-mod-fullstack-https-portal'
    networks:
      - 'nestjs-mod-fullstack-network'
    ports:
      - '80:80'
      - '443:443'
    links:
      - nestjs-mod-fullstack-nginx
    restart: always
    environment:
      STAGE: '${HTTPS_PORTAL_STAGE}'
      FORCE_RENEW: 'true'
      DOMAINS: '${SERVER_DOMAIN} -> http://nestjs-mod-fullstack-nginx:8080'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_started
    volumes:
      - nestjs-mod-fullstack-https-portal-volume:/var/lib/https-portal
volumes:
  nestjs-mod-fullstack-postgre-sql-volume:
    name: 'nestjs-mod-fullstack-postgre-sql-volume'
  nestjs-mod-fullstack-https-portal-volume:
    name: 'nestjs-mod-fullstack-https-portal-volume'
```

### 11. На локальном компьютере, открываем доступ к Swagger-интерфейсу бэкенда в Nginx

Обновленный файл `.docker/nginx/nginx.conf`

```bash
map $sent_http_content_type $expires {
    "text/html" epoch;
    "text/html; charset=utf-8" epoch;
    default off;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 8080;
    server_name localhost;

    gzip on;
    gzip_proxied any;
    gzip_types text/plain application/xml text/css application/javascript application/json;
    gzip_min_length 1000;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.(?!.*SV1)";

    client_max_body_size 50m;
    proxy_connect_timeout 5m;
    proxy_send_timeout 5m;
    proxy_read_timeout 5m;
    send_timeout 5m;

    proxy_max_temp_file_size 0;

    root /usr/share/nginx/html;
    index index.html;


    location /api {
        proxy_pass http://nestjs-mod-fullstack-server:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header Origin $http_origin;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # kill cache
        add_header Last-Modified $date_gmt;
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        if_modified_since off;
        expires off;
        etag off;
    }

    location /swagger {
        proxy_pass http://nestjs-mod-fullstack-server:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header Origin $http_origin;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # kill cache
        add_header Last-Modified $date_gmt;
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        if_modified_since off;
        expires off;
        etag off;
    }

    location / {
        expires $expires;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header Origin $http_origin;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 1m;
        proxy_connect_timeout 1m;
        proxy_intercept_errors on;
        error_page 404 =200 /index.html;
        root /usr/share/nginx/html;
    }
}
```

### 12. На локальном компьютере, добавляем возможность отключения NestJS модуля по выдаче статики

Так как в режиме "Docker Compose" мы раздаем статику через Nginx, то нам не нужно собирать бэкенд с встроенной статикой и значит не нужны дополнительные обработчики для поддержки выдачи статики.

Обновленный файл `apps/server/src/app/app.module.ts`

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { PrismaModule } from '@nestjs-mod/prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    PrismaModule.forFeature({ featureModuleName: 'app' }),
    ...(process.env.DISABLE_SERVE_STATIC
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, 'assets', 'client'),
          }),
        ]),
  ],
  controllers: [AppController],
  providers: [AppService],
});
```

### 13. На локальном компьютере, повтороно прогоняем запуск и тестирование двух режимов: PM2-продакшен и "Docker Compose"

E2E-тесты запускаем указывая внешний глобальный ИП адрес приложений.

_Команды_

```bash
npm i
npx playwright install
npx playwright install-deps

npm run test

cp example.env .env
npm run pm2-full:prod:start
export BASE_URL=http://194.226.49.162:3000 && npm run test:e2e
npm run pm2-full:prod:stop

npm run docker-compose-full:prod:start
export BASE_URL=http://194.226.49.162:8080 && npm run test:e2e
npm run docker-compose-full:prod:stop
```

Тесты успешно прошли

### 14. На локальном компьютере, добавляем дополнительный контейнер с `https-portal` в `docker-compose-full.yml` для проксирования `http` в `https` и добавляем во все (кроме migrations) контейнеры опцию `restart: 'always'`

Обновленный файл `.docker/docker-compose-full.yml`

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
    volumes:
      - 'nestjs-mod-fullstack-postgre-sql-volume:/bitnami/postgresql'
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
      POSTGRESQL_USERNAME: '${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}'
      POSTGRESQL_PASSWORD: '${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}'
      POSTGRESQL_DATABASE: '${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}'
  nestjs-mod-fullstack-postgre-sql-migrations:
    image: 'node:20-bullseye-slim'
    container_name: 'nestjs-mod-fullstack-postgre-sql-migrations'
    networks:
      - 'nestjs-mod-fullstack-network'
    working_dir: '/app'
    volumes:
      - './../:/app'
    command: 'npm run docker-compose-full:prod:fill:database'
    tty: true
    environment:
      NX_SKIP_NX_CACHE: 'true'
      SERVER_ROOT_DATABASE_URL: '${SERVER_ROOT_DATABASE_URL}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: 'service_healthy'
  nestjs-mod-fullstack-server:
    image: 'nestjs-mod-fullstack-server:latest'
    container_name: 'nestjs-mod-fullstack-server'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'npx -y wait-on --timeout= --interval=1000 --window --verbose --log http://localhost:8080/api/health']
      interval: 30s
      timeout: 10s
      retries: 10
    tty: true
    environment:
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-nginx:
    image: nginx:alpine
    container_name: 'nestjs-mod-fullstack-nginx'
    networks:
      - 'nestjs-mod-fullstack-network'
    volumes:
      - ../.docker/nginx:/etc/nginx/conf.d
      - ../dist/apps/client/browser:/usr/share/nginx/html
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-server:
        condition: service_healthy
    ports:
      - '8080:8080'
  nestjs-mod-fullstack-https-portal:
    image: steveltn/https-portal:1
    container_name: 'nestjs-mod-fullstack-https-portal'
    networks:
      - 'nestjs-mod-fullstack-network'
    ports:
      - '80:80'
      - '443:443'
    links:
      - nestjs-mod-fullstack-nginx
    restart: always
    environment:
      STAGE: '${HTTPS_PORTAL_STAGE}'
      FORCE_RENEW: 'true'
      DOMAINS: '${SERVER_DOMAIN} -> http://nestjs-mod-fullstack-nginx:8080'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_started
    volumes:
      - nestjs-mod-fullstack-https-portal-volume:/var/lib/https-portal
volumes:
  nestjs-mod-fullstack-postgre-sql-volume:
    name: 'nestjs-mod-fullstack-postgre-sql-volume'
  nestjs-mod-fullstack-https-portal-volume:
    name: 'nestjs-mod-fullstack-https-portal-volume'
```

### 15. На локальном компьютере, добавляем новую переменную окружения с нашим доменом vps1724252356.tech0.ru

Обновленный файл `.docker/docker-compose-full.env`

```bash
SERVER_ROOT_DATABASE_URL=postgres://postgres:postgres_password@nestjs-mod-fullstack-postgre-sql:5432/postgres?schema=public
SERVER_APP_DATABASE_URL=postgres://app:app_password@nestjs-mod-fullstack-postgre-sql:5432/app?schema=public
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
SERVER_DOMAIN=vps1724252356.tech0.ru
HTTPS_PORTAL_STAGE=production # local|production
```

### 17. На локальном компьютере, коммитим изменения в репозиторий

_Команды_

```
git commit -m "fix: some updates"
git push
```

### 18. Подключаемся к удаленному серверу, получаем новые изменения и останавливаем "PM2" и "Docker Compose" режимы

_Команды_

```
ssh root@194.226.49.162
cd nestjs-mod-fullstack
npm run pm2-full:prod:stop
npm run docker-compose-full:prod:stop
```

### 19. Перезапускаем все приложения в режиме "Docker Compose" и прогоняем E2E-тесты, адрес сервера указываем https://vps1724252356.tech0.ru

_Команды_

```bash
npm run docker-compose-full:prod:start
export BASE_URL=https://vps1724252356.tech0.ru && npm run test:e2e
```

<spoiler title="Вывод консоли">

```bash
root@vps1724252356:~/nestjs-mod-fullstack# npm run docker-compose-full:prod:start

> @nestjs-mod-fullstack/source@0.0.0 docker-compose-full:prod:start
> export NX_DAEMON=false && export DISABLE_SERVE_STATIC=true && npm run generate && npm run build -- -c production && npm run docker:build:server:latest && export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility up -d


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (42s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (42s)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (357ms)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 4 out of 4 tasks.


> @nestjs-mod-fullstack/source@0.0.0 build
> npm run generate && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true -c production


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (38s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (38s)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (350ms)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 4 out of 4 tasks.


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-rest-sdk:build (8s)
   ✔  nx run app-angular-rest-sdk:build:production (9s)
   ✔  nx run server:build:production (13s)
   ✔  nx run client:build:production (19s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for 4 projects (28s)


> @nestjs-mod-fullstack/source@0.0.0 docker:build:server:latest
> docker build -t nestjs-mod-fullstack-server:latest -f ./.docker/server.Dockerfile . --progress=plain

#0 building with "default" instance using docker driver

#1 [internal] load build definition from server.Dockerfile
#1 transferring dockerfile: 1.65kB done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:20.16.0-alpine
#2 DONE 1.2s

#3 [internal] load .dockerignore
#3 transferring context: 79B 0.0s done
#3 DONE 0.0s

#4 [builder 1/7] FROM docker.io/library/node:20.16.0-alpine@sha256:eb8101caae9ac02229bd64c024919fe3d4504ff7f329da79ca60a04db08cef52
#4 DONE 0.0s

#5 [internal] load build context
#5 transferring context: 1.20MB 0.2s done
#5 DONE 0.2s

#6 [builder 2/7] WORKDIR /usr/src/app
#6 CACHED

#7 [builder 3/7] COPY . .
#7 DONE 0.2s

#8 [builder 4/7] RUN apk add dumb-init
#8 0.630 fetch https://dl-cdn.alpinelinux.org/alpine/v3.20/main/x86_64/APKINDEX.tar.gz
#8 1.055 fetch https://dl-cdn.alpinelinux.org/alpine/v3.20/community/x86_64/APKINDEX.tar.gz
#8 1.791 (1/1) Installing dumb-init (1.2.5-r3)
#8 1.820 Executing busybox-1.36.1-r29.trigger
#8 1.836 OK: 11 MiB in 17 packages
#8 DONE 2.0s

#9 [builder 5/7] RUN apk add jq
#9 1.136 (1/2) Installing oniguruma (6.9.9-r0)
#9 1.302 (2/2) Installing jq (1.7.1-r0)
#9 1.361 Executing busybox-1.36.1-r29.trigger
#9 1.379 OK: 12 MiB in 19 packages
#9 DONE 1.7s

#10 [builder 6/7] RUN echo $(cat package.json | jq 'del(.devDependencies)') > package.json
#10 DONE 0.5s

#11 [builder 7/7] RUN rm -rf nx.json package-lock.json .dockerignore &&     cp .docker/nx.json nx.json &&     cp .docker/.dockerignore .dockerignore &&     npm install &&     npm install --save-dev nx@19.5.3 prisma@5.18.0 prisma-class-generator@0.2.11 &&     echo '' > .env &&     npm run prisma:generate &&     rm -rf /usr/src/app/node_modules/@nx &&     rm -rf /usr/src/app/node_modules/@prisma-class-generator &&     rm -rf /usr/src/app/node_modules/@angular  &&     rm -rf /usr/src/app/node_modules/@swc  &&     rm -rf /usr/src/app/node_modules/@babel  &&     rm -rf /usr/src/app/node_modules/@angular-devkit &&     rm -rf /usr/src/app/node_modules/@ngneat &&     rm -rf /usr/src/app/node_modules/@types &&     rm -rf /usr/src/app/node_modules/@ng-packagr
#11 112.9
#11 112.9 added 408 packages, and audited 409 packages in 2m
#11 112.9
#11 112.9 53 packages are looking for funding
#11 112.9   run `npm fund` for details
#11 112.9
#11 112.9 5 moderate severity vulnerabilities
#11 112.9
#11 112.9 To address all issues (including breaking changes), run:
#11 112.9   npm audit fix --force
#11 112.9
#11 112.9 Run `npm audit` for details.
#11 112.9 npm notice
#11 112.9 npm notice New patch version of npm available! 10.8.1 -> 10.8.2
#11 112.9 npm notice Changelog: https://github.com/npm/cli/releases/tag/v10.8.2
#11 112.9 npm notice To update run: npm install -g npm@10.8.2
#11 112.9 npm notice
#11 166.3
#11 166.3 added 106 packages, and audited 515 packages in 53s
#11 166.3
#11 166.3 66 packages are looking for funding
#11 166.3   run `npm fund` for details
#11 166.4
#11 166.4 5 moderate severity vulnerabilities
#11 166.4
#11 166.4 To address all issues (including breaking changes), run:
#11 166.4   npm audit fix --force
#11 166.4
#11 166.4 Run `npm audit` for details.
#11 166.7
#11 166.7 > @nestjs-mod-fullstack/source@0.0.0 prisma:generate
#11 166.7 > ./node_modules/.bin/nx run-many -t=prisma-generate
#11 166.7
#11 169.4
#11 169.4  NX   Running target prisma-generate for project server:
#11 169.4
#11 169.4 - server
#11 169.4
#11 169.4
#11 177.6
#11 177.6 > nx run server:prisma-generate
#11 177.6
#11 177.6 > ./node_modules/.bin/prisma generate --schema=./apps/server/src/prisma/app-schema.prisma
#11 177.6
#11 177.6 Environment variables loaded from .env
#11 177.6 Prisma schema loaded from apps/server/src/prisma/app-schema.prisma
#11 177.6 prisma:info [Prisma Class Generator]:Handler Registered.
#11 177.6 prisma:info [Prisma Class Generator]:Generate /usr/src/app/apps/server/src/app/generated/rest/dto/app_demo.ts
#11 177.6 prisma:info [Prisma Class Generator]:Generate /usr/src/app/apps/server/src/app/generated/rest/dto/migrations.ts
#11 177.6
#11 177.6 ✔ Generated Prisma Client (v5.18.0, engine=binary) to ./node_modules/@prisma/app-client in 308ms
#11 177.6
#11 177.6 ✔ Generated Prisma Class Generator to ./apps/server/src/app/generated/rest/dto in 408ms
#11 177.6
#11 177.6 Start by importing your Prisma Client (See: http://pris.ly/d/importing-client)
#11 177.6
#11 177.6 Tip: Easily identify and fix slow SQL queries in your app. Optimize helps you enhance your visibility: https://pris.ly/--optimize
#11 177.6
#11 177.6
#11 177.6
#11 177.6
#11 177.6  NX   Successfully ran target prisma-generate for project server
#11 177.6
#11 177.6
#11 DONE 178.9s

#12 [stage-1 3/4] COPY --from=builder /usr/src/app/ /usr/src/app/
#12 DONE 8.3s

#13 [stage-1 4/4] COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
#13 DONE 0.1s

#14 exporting to image
#14 exporting layers
#14 exporting layers 8.7s done
#14 writing image sha256:049c6f471ddfe18b811e6aac12cccd777dfab0bb1d599b00c91beb51d1ff188f done
#14 naming to docker.io/library/nestjs-mod-fullstack-server:latest done
#14 DONE 8.7s
WARN[0000] /root/nestjs-mod-fullstack/.docker/docker-compose-full.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 5/5
 ✔ Container nestjs-mod-fullstack-postgre-sql             Healthy                                                                                                13.9s
 ✔ Container nestjs-mod-fullstack-postgre-sql-migrations  Exited                                                                                                 30.9s
 ✔ Container nestjs-mod-fullstack-server                  Healthy                                                                                                65.1s
 ✔ Container nestjs-mod-fullstack-nginx                   Started                                                                                                65.1s
 ✔ Container nestjs-mod-fullstack-https-portal            Started                                                                                                65.2s

root@vps1724252356:~/nestjs-mod-fullstack# export BASE_URL=https://vps1724252356.tech0.ru && npm run test:e2e

> @nestjs-mod-fullstack/source@0.0.0 test:e2e
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes



> nx run client-e2e:e2e

> playwright test

 NX   Running target e2e for 2 projects and 1 task they depend on


 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/3 remaining tasks...


   ✔  nx run client-e2e:e2e (25s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
   ✔  nx run server:build:production (14s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————



——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/1 remaining tasks...

   ⠹  nx run server-e2e:e2e

   ✔  2/2 succeeded [0 read from cache]

 PASS   server-e2e  apps/server-e2e/src/server/server.spec.ts
  GET /api
    ✓ should return a message (160 ms)
   ✔  nx run server-e2e:e2e (10s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for 2 projects and 1 task they depend on (50s)
```

</spoiler>

### 20. Перезапускаем все приложения в режиме PM2-продакшен и прогоняем E2E-тесты, адрес сервера указываем http://vps1724252356.tech0.ru:3000

_Команды_

```bash
npm run pm2-full:prod:start
export BASE_URL=http://vps1724252356.tech0.ru:3000 && npm run test:e2e
```

<spoiler title="Вывод консоли">

```bash
root@vps1724252356:~/nestjs-mod-fullstack# npm run pm2-full:prod:start

> @nestjs-mod-fullstack/source@0.0.0 pm2-full:prod:start
> npm run generate && npm run build -- -c production && npm run docker-compose:start-prod:server && npm run db:create && npm run flyway:migrate && npm run pm2:start


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (1m)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (1m)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint (4s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (5s)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 3 out of 4 tasks.


> @nestjs-mod-fullstack/source@0.0.0 build
> npm run generate && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true -c production


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix


   ✔  nx run server:generate (43s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target generate for project server (43s)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-angular-rest-sdk:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint  [existing outputs match the cache, left as is]
   ✔  nx run server:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 4 projects (373ms)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 4 out of 4 tasks.


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run app-rest-sdk:build (1m)
   ✔  nx run app-angular-rest-sdk:build:production (1m)
   ✔  nx run server:build:production (1m)
   ✔  nx run client:build:production (23s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for 4 projects (2m)


> @nestjs-mod-fullstack/source@0.0.0 docker-compose:start-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env --compatibility up -d

WARN[0000] /root/nestjs-mod-fullstack/apps/server/docker-compose-prod.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 1/1
 ✔ Container server-postgre-sql  Started                                                                                                                          0.7s

> @nestjs-mod-fullstack/source@0.0.0 db:create
> ./node_modules/.bin/nx run-many -t=db-create


   ✔  nx run server:db-create (3s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target db-create for project server (4s)


> @nestjs-mod-fullstack/source@0.0.0 flyway:migrate
> ./node_modules/.bin/nx run-many -t=flyway-migrate


   ✔  nx run server:flyway-migrate (5s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target flyway-migrate for project server (5s)


> @nestjs-mod-fullstack/source@0.0.0 pm2:start
> ./node_modules/.bin/pm2 start ./ecosystem-prod.config.json && npm run wait-on -- --log http://localhost:3000/api/health --log http://localhost:3000

[PM2] Spawning PM2 daemon with pm2_home=/root/.pm2
[PM2] PM2 Successfully daemonized
[PM2][WARN] Applications nestjs-mod-fullstack not running, starting...
[PM2] App [nestjs-mod-fullstack] launched (1 instances)
┌────┬─────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name                    │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ nestjs-mod-fullstack    │ default     │ N/A     │ fork    │ 505154   │ 0s     │ 0    │ online    │ 0%       │ 28.8mb   │ root     │ disabled │
└────┴─────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

> @nestjs-mod-fullstack/source@0.0.0 wait-on
> ./node_modules/.bin/wait-on --timeout=240000 --interval=1000 --window --verbose --log http://localhost:3000/api/health --log http://localhost:3000

waiting for 2 resources: http://localhost:3000/api/health, http://localhost:3000
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:3000 ...
  HTTP(S) error for http://localhost:3000/api/health AggregateError
  HTTP(S) error for http://localhost:3000 AggregateError
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:3000 ...
  HTTP(S) error for http://localhost:3000/api/health AggregateError
  HTTP(S) error for http://localhost:3000 AggregateError
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
  HTTP(S) error for http://localhost:3000/api/health AggregateError
making HTTP(S) head request to  url:http://localhost:3000 ...
  HTTP(S) error for http://localhost:3000 AggregateError
making HTTP(S) head request to  url:http://localhost:3000/api/health ...
making HTTP(S) head request to  url:http://localhost:3000 ...
  HTTP(S) result for http://localhost:3000/api/health: {
  status: 200,
  statusText: 'OK',
  headers: Object [AxiosHeaders] {
    'x-powered-by': 'Express',
    vary: 'Origin',
    'access-control-allow-credentials': 'true',
    'x-request-id': 'bd416d0d-2e53-4f4a-8402-58e367c833c5',
    'cache-control': 'no-cache, no-store, must-revalidate',
    'content-type': 'application/json; charset=utf-8',
    'content-length': '107',
    etag: 'W/"6b-ouXVoNOXyOxnMfI7caewF8/p97A"',
    date: 'Thu, 22 Aug 2024 18:58:09 GMT',
    connection: 'keep-alive',
    'keep-alive': 'timeout=5'
  },
  data: ''
}
waiting for 1 resources: http://localhost:3000
  HTTP(S) result for http://localhost:3000: {
  status: 200,
  statusText: 'OK',
  headers: Object [AxiosHeaders] {
    'x-powered-by': 'Express',
    vary: 'Origin',
    'access-control-allow-credentials': 'true',
    'accept-ranges': 'bytes',
    'cache-control': 'public, max-age=0',
    'last-modified': 'Thu, 22 Aug 2024 18:57:47 GMT',
    etag: 'W/"8e8-1917b73ba3d"',
    'content-type': 'text/html; charset=UTF-8',
    'content-length': '2280',
    date: 'Thu, 22 Aug 2024 18:58:09 GMT',
    connection: 'keep-alive',
    'keep-alive': 'timeout=5'
  },
  data: ''
}
wait-on(505210) complete

root@vps1724252356:~/nestjs-mod-fullstack# export BASE_URL=http://vps1724252356.tech0.ru:3000 && npm run test:e2e

> @nestjs-mod-fullstack/source@0.0.0 test:e2e
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes



> nx run client-e2e:e2e

> playwright test

 NX   Running target e2e for 2 projects and 1 task they depend on


 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/3 remaining tasks...


   ✔  nx run client-e2e:e2e (39s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
   ✔  nx run server:build:production (16s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————



——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/1 remaining tasks...

   ⠴  nx run server-e2e:e2e

   ✔  2/2 succeeded [0 read from cache]

 PASS   server-e2e  apps/server-e2e/src/server/server.spec.ts
  GET /api
    ✓ should return a message (74 ms)
   ✔  nx run server-e2e:e2e (11s)

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for 2 projects and 1 task they depend on (1m)
```

</spoiler>

### 21. Настраиваем автоматический перезапуск PM2-продакшен режима при перезагрузке выделенного сервера

_Команды_

```bash
./node_modules/.bin/pm2 startup
./node_modules/.bin/pm2 save
```

<spoiler title="Вывод консоли">

```bash
root@vps1724252356:~/nestjs-mod-fullstack# ./node_modules/.bin/pm2 startup
[PM2] Init System found: systemd
Platform systemd
Template
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=root
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/root/.vscode-server/cli/servers/Stable-fee1edb8d6d72a0ddff41e5f71a671c23ed924b9/server/bin/remote-cli:/root/.nvm/versions/node/v20.16.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=PM2_HOME=/root/.pm2
PIDFile=/root/.pm2/pm2.pid
Restart=on-failure

ExecStart=/root/nestjs-mod-fullstack/node_modules/pm2/bin/pm2 resurrect
ExecReload=/root/nestjs-mod-fullstack/node_modules/pm2/bin/pm2 reload all
ExecStop=/root/nestjs-mod-fullstack/node_modules/pm2/bin/pm2 kill

[Install]
WantedBy=multi-user.target

Target path
/etc/systemd/system/pm2-root.service
Command list
[ 'systemctl enable pm2-root' ]
[PM2] Writing init configuration in /etc/systemd/system/pm2-root.service
[PM2] Making script booting at startup...
[PM2] [-] Executing: systemctl enable pm2-root...
Created symlink /etc/systemd/system/multi-user.target.wants/pm2-root.service → /etc/systemd/system/pm2-root.service.
[PM2] [v] Command successfully executed.
+---------------------------------------+
[PM2] Freeze a process list on reboot via:
$ pm2 save

[PM2] Remove init script via:
$ pm2 unstartup systemd

root@vps1724252356:~/nestjs-mod-fullstack# ./node_modules/.bin/pm2 save
[PM2] Saving current process list...
[PM2] Successfully saved in /root/.pm2/dump.pm2
```

</spoiler>

### 22. Перезагружаем и проверяем через E2E-тест работу обоих режимом

_Команды_

```bash
sudo reboot

cd nestjs-mod-fullstack
export BASE_URL=http://vps1724252356.tech0.ru:3000 && npm run test:e2e
export BASE_URL=https://vps1724252356.tech0.ru && npm run test:e2e
```

<spoiler title="Вывод консоли">

```bash
root@vps1724252356:~/nestjs-mod-fullstack# export BASE_URL=http://vps1724252356.tech0.ru:3000 && npm run test:e2e

> @nestjs-mod-fullstack/source@0.0.0 test:e2e
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes



> nx run client-e2e:e2e

> playwright test

 NX   Running target e2e for 2 projects and 1 task they depend on


 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/3 remaining tasks...


   ✔  nx run client-e2e:e2e (29s)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
   ✔  nx run server:build:production (15s)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————



———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/1 remaining tasks...

   ⠏  nx run server-e2e:e2e

   ✔  2/2 succeeded [0 read from cache]

 PASS   server-e2e  apps/server-e2e/src/server/server.spec.ts
  GET /api
    ✓ should return a message (73 ms)
   ✔  nx run server-e2e:e2e (12s)

———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for 2 projects and 1 task they depend on (56s)
```

</spoiler>

В следующем посте я добавлю CI/CD конфиг для деплоя на выделенный сервер с помощью GitHub Actions...

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/commit/b9715a203364877a4ffae6e7cb3a1dff59ede6d6 - коммит на текущие изменения

#pm2 #docker #nestjsmod #fullstack
