FROM node:16.14
 
WORKDIR /app
 
COPY package*.json /app/
 
RUN npm install
 
COPY . /app
 
EXPOSE 6500
 
CMD ["npm", "start"]
