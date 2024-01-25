# Build with Bun
FROM docker.io/oven/bun:latest as build

ARG RELEASE_BRANCH
ARG RELEASE_DATE
ARG RELEASE_COMMIT

ENV VITE_RELEASE_BRANCH=${RELEASE_BRANCH}
ENV VITE_RELEASE_DATE=${RELEASE_DATE}
ENV VITE_RELEASE_COMMIT=${RELEASE_COMMIT}

ENV VITE_API_URL="https://api.cloud.cbh.kth.se"
ENV VITE_DEPLOY_API_URL="https://api.cloud.cbh.kth.se/deploy/v1"

WORKDIR /app
COPY . /app

RUN bun install
RUN bun run build

# Serve with NGINX
FROM nginx
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]