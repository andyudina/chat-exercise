## RESTful backend for simple chat


### Functional requirements:
1. Sign up/ log in with google oath
2. Create nickname on sign up
3. Search -> find user by nickname or find group chat by nickname
4. Create group chat
5. Join group chat
6. List recent group and private chats
7. Send message to chat
8. List messages from chat/group


## APIs
Throw 403 forbidden, if user is not authrosied

- get /users/self/ -> get information about current user
- put /users/self/ -> create nickname

- get /chats/?name=name -> get chats or users with name
- post /chats/group/ -> create group chat
- post /chats/private/ -> start chat with user
- put /chats/[chat-id]/ -> join group chat

- get /users/self/chats/ -> get all chats of the user

- get /users/self/chats/[chat-id]/messages/?page=page -> paginated list messages
- get /users/self/chats/[chat-id]/ -> get chat info and first page of messages
- post /users/self/chats/[chat-id]/messages/ -> create a message


## Models

* User
    * nickname
    * email
    * chats [ [uuid] ]
    * createdAt

* Chat
    * users: [ [uuid] ]
    * name
    * isGroupChat
    * createdAt

* Message
    * chat (uuid)
    * text
    * author (uuid)
    * createdAt
