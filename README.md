## HW1 MERN COURSE

- In this assignment, I have to create a REST API and Socket.io server, based on Node.js, Express, and Socket.io.
- I also required to write a unit test for each API, socket.io events.
- The socket calls implementation is the same as the REST controller, so there is no duplication in the code.


### SCHEMA
- Post Schema     
{
message: String,
sender: String
}
- User Schema     
{
email: String,
password: String,
refresh_tokens: [String]
}
- Message Schema     
{
message: String,
sender: String,
reciver: String
}


### API
- GETL ALL POSTS - This API return all the posts in the DB
 GET http://localhost:3000/post
-  GETL POSTS BY SENDER - This API retunr all the posts in the DB that send by this sender ID
 GET http://localhost:3000/post?sender={senderID}
-  GET POSTS BY ID - This API return post by ID
 GET http://localhost:3000/post/{postID}
-  ADD NEW POST - This API create a new post
POST http://localhost:3000/post
add request body to the request {
"message": "YOUR MESSAGE",
"sender": "senderID"
}
-  UPDATE POST BY ID - This API update post by id
PUT http://localhost:3000/post/{postID}
add request body to the request {
"message": "YOUR NEW MESSAGE",
}

### Socket.Io
- Add new post: the event is “post:post”, the data is the same as in the REST api.
- Get all posts: the event is“post:get”
- Get post by id: the event is “post:get:id”, the id will be specified in the arguments of the event in the form: {“id” : 12345… }
- Get a post by sender: the event is “post:get:sender”, the sender will be specified in the arguments of the event in the form: {“sender” : 12345… }
- Update a post: the event is “post:put”, the data is the same as in the REST api.




### HOW TO RUN THIS PROJECT
1. Clone the repository to your local machine:
git clone https://github.com/ronman194/hw2-mern.git
2. Navigate to the root directory of the project and install the dependencies:
npm install
3. Add .env file that include the following variables: 
 - NODE_ENV = development
 - PORT = 3000
 - DB_URL = ENTER YOUR MONGODB URL
  - ACCESS_TOKEN_SECRET = 128 bit key
  - REFRESH_TOKEN_SECRET = 128 bit key
  - JWT_TOKEN_EXPIRATION = 1h
4. Add .testenv file that include the following variables: 
 - NODE_ENV = development
 - PORT = 3000
 - DB_URL = ENTER YOUR MONGODB URL
  - ACCESS_TOKEN_SECRET = 128 bit key
  - REFRESH_TOKEN_SECRET = 128 bit key
  - JWT_TOKEN_EXPIRATION = 1h  OR 5s ( 5s if we run testAuth script)
5. Start the application: (in the directory root.)
npm start

### DOCUMENTATION
- Swagger offers the ability to generate interactive documentation for your API. This documentation provides details about the endpoints in your API, including the request and response formats and examples of how to use them. You can access this documentation through a web interface and even test out the API's endpoints using a built-in testing too
- To see the documentation follow the next steps:
	1. Follow the section how to run this project (run with npm start).
	2. In the browser enter the next url: http://localhost:3000/api-docs


### TOOLS
- MongoDB
- Express
- nodeJS
- JEST (Unit tests)
- Supertest
- Socket.Io
- Swagger