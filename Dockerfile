FROM node:16.14

MAINTAINER hansol

WORKDIR /app
 
COPY package*.json /app/
 
RUN npm install
 
COPY . /app
 
EXPOSE 6500
 
CMD ["npm", "start"]
