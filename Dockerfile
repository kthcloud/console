FROM node as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV CHOKIDAR_USEPOLLING=true

ENV REACT_APP_API_URL=https://api.cloud.cbh.kth.se
ENV REACT_APP_RELEASE_BRANCH=${REACT_APP_RELEASE_BRANCH}
ENV REACT_APP_RELEASE_DATE=${REACT_APP_RELEASE_DATE}
ENV REACT_APP_RELEASE_COMMIT=${REACT_APP_RELEASE_COMMIT}

COPY ./package.json /app/
COPY ./package-lock.json /app/
COPY . /app
RUN npm ci --production
RUN npm install
RUN npm run build

# stage 2 - build the final image and copy the react build files
FROM nginx
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]