# pull official base image
FROM node:14-alpine

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json .
COPY package-lock.json .
RUN npm i
RUN npm install react-scripts@3.4.1 -g --silent

# add app
COPY . .

# start app
CMD ["npm", "start"]