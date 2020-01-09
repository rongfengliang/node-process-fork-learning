FROM node:12.14.0-alpine3.9
WORKDIR /app
COPY app.js /app/app.js
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
COPY metrics.js /app/metrics.js
COPY utils.js  /app/utils.js
COPY taskstatus.js  /app/taskstatus.js
COPY send_mail.js /app/send_mail.js
#CMD [ "yarn","app"]
EXPOSE 8080
RUN yarn
ENTRYPOINT [ "yarn","app" ]