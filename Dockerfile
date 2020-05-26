FROM node:latest

WORKDIR /use/src/app

COPY  package*.json ./

RUN npm install

COPY . .

EXPOSE 5000
#EXPOSE 27017

#CMD [ "npm" ,"start"]
ENTRYPOINT chdir /use/src/app  &&  sh startup.sh

