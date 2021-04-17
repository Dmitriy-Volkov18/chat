import React, {useState, useEffect, useRef} from 'react'
import { io } from "socket.io-client";
import Message from '../Message/Message'
import AllUsers from '../AllUsersCopy/AllUsers'
import "./Chat.styles.css"
import {useSelector} from "react-redux"
import axios from "axios"
import {useDispatch} from "react-redux"
import {logout} from "../../redux/actions/userActions"
import colors from "../../colors"

let randomColor = Math.floor(Math.random() * colors.length);

const Chat = () => {
    const socketRef = useRef();
    const [messages, setMessages] = useState([])
    const [onlineUsers, setOnlineUsers] = useState([])
    const [newMessages, setNewMessages] = useState([])
    const [userId, setUserId] = useState("")

    const messageRef = useRef()

    const token = useSelector(state => state.user.token)
    const isAdmin = useSelector(state => state.user.isAdmin)

    const [fetchedAllMessages, setFetchedAllMessages] = useState([])

    const chat_body_ref = useRef()

    const isBannedRef = useRef()
    const dispatch = useDispatch()

    const colorsRef = useRef()
    colorsRef.current = colors

    const lastMessage = useRef()

    useEffect(() => {
        if(token){
            const payload = JSON.parse(atob(token.split(".")[1]))
            setUserId(payload)
        }
        socketRef.current = io("http://localhost:5000", {
            auth: {token}
        });

        socketRef.current.emit("joinRoom", "chatRoom")

        socketRef.current.on("fetchOnlineUsers", (onlineUser) => {
            setOnlineUsers(onlineUser)
        })

        socketRef.current.on("disconnect", () => {
            dispatch(logout())
        })

        return () => {
            socketRef.current.emit("leaveRoom", "chatRoom")
            socketRef.current.close()
        }
    }, [token])

    useEffect(() => {
        socketRef.current.on("newMessage", (message) => {
            setNewMessages([...newMessages, message])
            lastMessage.current = message
        })
    }, [newMessages])

    useEffect(() => {
        socketRef.current.on("message", (msg) => {
            setMessages(m => [...m, msg])
        })
    }, [])

    useEffect(() => {
        const asyncFetchMessages = async() => {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            
            if(token){
                config.headers.authorization = token
                axios.defaults.headers.common['Authorization'] = token;
            }else{
                return
            }
    
            let response = await axios.get("http://localhost:5000/api/messages/getAllMessages", config)
            const data = await response.data
            setFetchedAllMessages(data.messages)
        }

        asyncFetchMessages()
    }, [token])

    useEffect(() => {
        chat_body_ref.current.scrollTop = chat_body_ref.current.scrollHeight
    })

    const payload = JSON.parse(atob(token.split(".")[1]))
    const [mute, setMuted] = useState(false)

    // useEffect(() => {
    //     socketRef.current.on("muteUserUsername", (muteValueq) => {
    //         messageRef.current.disabled = muteValueq
    //         setMuted(muteValueq)
    //     })

    //     socketRef.current.on("unMuteUserUsername", (muteValueq) => {
    //         messageRef.current.disabled = muteValueq
    //         setMuted(muteValueq)
    //     })
    // })

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

    useEffect(() => {
        const findUser = async () => {
            try{
                const config = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                
                if(token){
                    config.headers.authorization = token
                    axios.defaults.headers.common['Authorization'] = token;
                }else{
                    return
                }

                const foundUser = await axios.get(`http://localhost:5000/api/users/${payload.username}`, config)

                if(foundUser){
                    const muteValue = foundUser.data.user.status.isMuted
                    // socketRef.current.emit("muteUser", muteValue)
                    
                    // socketRef.current.on("muteUserUsername", (muteValueq) => {
                        
                    // })
                    messageRef.current.disabled = muteValue
                    setMuted(muteValue)
                }
            }catch(err){
                console.log(err.response.data.error)
            }
        }
                
        if(payload.username) findUser()

    }, [payload.username, token])

    useEffect(() => {
        socketRef.current.on("banUser", (isBanned) => {
            isBannedRef.current = isBanned
            console.log(isBannedRef.current)
            // if(isBannedRef.current){
            //     dispatch(logout())
            // }
        })
    }, [])

    const emitMessage = () => {
        socketRef.current.emit("chatRoomMessage", {
            chatRoom: "chatRoom",
            message: messageRef.current.value
        })

        messageRef.current.value = ""
    }

    const handleSendMessage = () => {
        if(messageRef.current.value === "") return

        if(lastMessage?.current?.date){
            if(new Date(lastMessage.current.date).getTime() > new Date(lastMessage.current.date).getTime() + 5000){
                emitMessage()
            }else{
                setTimeout(() => {
                    emitMessage()
                }, 5000)
            }
        }else{
            emitMessage()
        }
    }

    let assignColor = getRandomColor()
    let newName

    return (
        <div className="chat_container">
            <h1>Welcome to the chat</h1>
            
            <div className="chat-ui">
                <div className="online-users-container">
                    <h2>Online users</h2>
                    <ul>
                        {
                            Object.values(onlineUsers).map((onlineUser, index) => {
                                    newName = onlineUser
                                    if(onlineUser !== newName){
                                        return <li key={index} style={{color:getRandomColor()}}>{onlineUser}</li> 

                                    }else{
                                        return <li key={index} style={{color:assignColor}}>{onlineUser}</li> 
                                    }
                                }
                            )
                        }
                    </ul>
                </div>

                <div className="chat-block">
                    <div className="chat-header"></div>

                    <div className="chat-body-block" ref={chat_body_ref}>
                        {
                            fetchedAllMessages.map((message, index) => 
                                (<Message key={index} message={message}
                                    specificClass={userId.id === message.userCreated ? "currentUser" : "anotherUser"}
                                    currentUser={userId.id === message.userCreated ? true : false}
                                    color1={{color:getRandomColor()}}
                                />)
                            ) 
                        }
                        {
                            messages.map((message, index) => 
                                (<Message key={index} message={message} />)
                            ) 
                        }
                        {
                            newMessages.map((message, index) => {
                                    return <Message
                                        key={index} message={message}
                                        specificClass={userId.id === message.userId ? "currentUser" : "anotherUser"}
                                        currentUser={userId.id === message.userId ? true : false}
                                        color1={colorsRef.current[randomColor]}
                                    />
                                }
                            ) 
                        }
                    </div>

                    <div className="form-block">
                        <textarea name="userMessage" ref={messageRef} placeholder={`${mute ? "You`ve been muted" : "Type a message 1 to 200 characters, 1 msg in 15 secs"}`}/>
                        <button onClick={handleSendMessage}>Send</button> 
                    </div>
                </div>

                {
                    isAdmin && (<AllUsers socket={socketRef.current} />)
                }
            </div>
        </div>
    )
}

export default Chat