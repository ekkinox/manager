FROM node:latest

RUN npm install --global nodemon

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /var/www && cp -a /tmp/node_modules /var/www/

WORKDIR /var/www
ADD . /var/www

EXPOSE 3000

CMD ["nodemon", "-L", "/var/www"]
