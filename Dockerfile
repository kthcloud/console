# Build with Bun
FROM --platform=$BUILDPLATFORM docker.io/oven/bun:latest AS build

ARG RELEASE_BRANCH
ARG RELEASE_DATE
ARG RELEASE_COMMIT

ENV NODE_ENV="production"

WORKDIR /app

COPY package*.json bun.lockb ./

RUN bun install

COPY .env .
COPY --chmod=777 scripts/ ./

RUN ./docker-envs.ts .env.production && \
    ./nginx-entrypoint.ts && \
    rm .env

ENV VITE_RELEASE_BRANCH=${RELEASE_BRANCH}
ENV VITE_RELEASE_DATE=${RELEASE_DATE}
ENV VITE_RELEASE_COMMIT=${RELEASE_COMMIT}

COPY .eslintrc.json jsconfig.json index.html tsconfig*.json vite.config.ts ./

COPY . .

RUN bun run build

# Serve with NGINX
FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

COPY --from=build --chmod=777 --link /app/entrypoint.sh .

# Set default values, can be overriden 
ENV DEPLOY_API_URL="https://api.cloud.cbh.kth.se/deploy/v2"
ENV ALERT_API_URL="https://alert.app.cloud.cbh.kth.se/"
ENV KEYCLOAK_URL="https://iam.cloud.cbh.kth.se"
ENV KEYCLOAK_REALM="cloud"
ENV KEYCLOAK_CLIENT_ID="landing"
ENV RANCHER_URL="https://mgmt.cloud.cbh.kth.se"
ENV DNS_URL="https://dns.cloud.cbh.kth.se"
ENV MAIA_URL="https://maia.app.cloud.cbh.kth.se/maia"
# can be comma separated to add more
ENV SERVER_PLATFORM="linux/amd64"

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
