# Simple chat service

Full-stack chat implementation. User can choose nickname, join group chat and send message to another user. Back-end: nodejs, express, mongodb + mongoose. Front-end: react/redux. Socket.io

## Getting started

How to install the app

### Prerequisites

1. Install Nodejs https://nodejs.org/en/download/
2. Install MongoDB https://docs.mongodb.com/v3.2/installation/
3. Get google credentials for authentication through google oauth: https://console.cloud.google.com/apis/credentials

### Installing

1. Clone this repo with submodules ```git clone  --recursive git@github.com:andyudina/chat-exercise.git```
2. Install dependenices for back-end and front-end: ```npm install && cd client && npm install```

## Running app locally

1. Running mongodn server using command ```mongod``` https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/
2. Set up environment variables. Back-end app depends on several environment variables, preferable way of setting them up is to create .env file in root directory. Required variables are:

   2.1. GOOGLE_CLIENTID and GOOGLE_SECRET - credentials, obtained through google console, needed for authentication

   2.2. MONGODB_URL - mongodb connection string (https://docs.mongodb.com/manual/reference/connection-string/). Usually looks like ```mongodb://localhost/[your-db-name]```
  
   2.3. SESSION_SECRET - the secret is used to hash the session, protected against session hijacking.

3. Start back-end dev server by running ```npm start```
4. Run webpack to build front-end app: ```cd client && npm start```
5. By default app will be served at http://localhost:3000/

## How to use

1. Log in with Google - user will be redirected to google authentication when he enters app first time (and any next time without cookies)
2. Choose nickname - on welcome screen user is prompted to choose nickname. User can also stay without nickname, then other users will see him as "Anonymous" in group conversations, and won't be able to start private chat with him
3. Join group chat - user can search group chat by name. User can join any chat from search results. Also user can create group chat with specific name
4. Start chat with other user - user can search for others by nickname and start chat with anyone (even with himself)

## Next steps

What is missing for production

1. Unit tests for React components and integration tests
2. Rewrite back-end tests, so they are not dependant on database
3. App level documentation and API descriptions
4. Rethink UI/UX. Support mobile platforms
5. Set up development environment using Docker
6. Set up CI pipeline
7. Refactor routing: set up reverse-proxy to serve statics and forward /api and /auth requests to nodejs servers. This will allow to get rid off submodules 
