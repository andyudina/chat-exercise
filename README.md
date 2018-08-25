## RESTful backend for simple chat


### Functional requirements:
**Must have**
1. Sign up/ log in with google oath
2. Create nickname on sign up
3. Search -> find user by nickname or find group chat by nickname
4. Create group chat
5. Join group chat
6. List recent group and individual chats
7. Send message to chat
8. List messages from chat/group

**Nice to have**
1. Display number unread messages in chats 
2. Message in chat as read
3. Update nickname
4. Delete account
5. Logout
6. Leave group chat


## APIs

post /users/ -> create nickname

get /chats/?name=name -> get chats or users with name
post /chats/ -> create group chat or chat with user
put /chats/[chat-uuid]/ -> join group chat

get /users/self/chats/ -> get all chats of the user

get /users/self/chats/[chatuuid]/messages/?pg=pg -> list messages on page pg
get /users/self/chats/[chatuuid]/ -> get chat info and first n messages
post /users/self/chats/[chatuuid]/messages/ -> create a message


## Models

* User
    * uuid
    * nickname
    * email
    * chats [ [uuid] ]

* Chat
    * users: [ [uuid] ]
    * name
    * isGroupChat
    * lastActivityAt

* Message
    * chat (uuid)
    * text
    * author (uuid)
    * createdAt
