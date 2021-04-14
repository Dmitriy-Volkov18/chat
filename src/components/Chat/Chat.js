import React, {useState, useEffect, useRef} from 'react'
import { io } from "socket.io-client";
import Message from '../Message/Message'
import AllUsers from '../AllUsers/AllUsers'
import "./Chat.styles.css"
import {useSelector} from "react-redux"
import axios from "axios"

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


    useEffect(() => {
        if(token){
            const payload = JSON.parse(atob(token.split(".")[1]))
            setUserId(payload)
        }
        socketRef.current = io("http://localhost:5000", {
            auth: {token}
        });

        socketRef.current.on("newMessage", (message) => {
            setNewMessages([...newMessages, message])
        })

        socketRef.current.emit("joinRoom", "chatRoom")

        socketRef.current.on("fetchOnlineUsers", (onlineUser) => {
            setOnlineUsers(onlineUser)
        })

        return () => {
            socketRef.current.emit("leaveRoom", "chatRoom")
            socketRef.current.close()
        }
    }, [newMessages, token])

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

    ////////////////////////


    const payload = JSON.parse(atob(token.split(".")[1]))
    const [mute, setMuted] = useState(false)
    const [value, setValue] = useState(false);

    // useEffect(() => {
        
    // })


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
    
    const handleSendMessage = () => {
        if(messageRef.current.value === "") return
        
        socketRef.current.emit("chatRoomMessage", {
            chatRoom: "chatRoom",
            message: messageRef.current.value
        })

        messageRef.current.value = ""
    }


    const colors = [
        { color: '#61FF4F' },
        { color: '#F5EE4C' },
        { color: '#4CF5AB' },
        { color: '#FF4FDF' },
        { color: '#8C414F' },
        { color: '#418C6D' },
        { color: '#4CD8F5' },
        { color: '#F55343' },
        { color: '#F61D19' },
        { color: '#2C418F' }
    ]

    let randomColor

    console.log(value)

    return (
        <div className="chat_container">
            <h1>Welcome to the chat</h1>
            
            <div className="chat-ui">
                <div className="online-users-container">
                    <h2>Online users</h2>
                    <ul>
                        {/* {
                            onlineUsers.map((onlineUser, index) => (
                                <li key={index} style={colors[Math.floor(Math.random() * colors.length)]}>{onlineUser.username}</li>
                            ))
                        } */}

                        {
                            
                            Object.values(onlineUsers).map((onlineUser, index) => {
                                    randomColor = Math.floor(Math.random() * colors.length);
                                    return <li key={index} style={colors[randomColor]}>{onlineUser}</li>
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
                                (<Message key={index} message={message} specificClass={userId.id === message.userCreated ? "currentUser" : "anotherUser"} currentUser={userId.id === message.userCreated ? true : false} color1={colors[Math.floor(Math.random() * colors.length)]} />)
                            ) 
                        }

                        {
                            newMessages.map((message, index) => {
                                    randomColor = Math.floor(Math.random() * colors.length);
                                    return <Message key={index} message={message} specificClass={userId.id === message.userId ? "currentUser" : "anotherUser"} currentUser={userId.id === message.userId ? true : false} color1={colors[randomColor]} />
                                }
                            ) 
                        }

                        {
                            messages.map((message, index) => 
                                (<Message key={index} message={message} />)
                            ) 
                        }

                    </div>

                    <div className="form-block">
                        <textarea name="userMessage" ref={messageRef} placeholder={`${mute ? "You`ve been muted" : "Type a message 1 to 200 characters"}`} disabled={mute} />
                        <button onClick={handleSendMessage}>Send</button> 
                    </div>
                </div>

                {
                    isAdmin && (<AllUsers callback={setValue} socket={socketRef} />)
                }
            </div>
        </div>
    )
}

export default Chat


/*  
2) сделать отправку сообщений через каждые 15 секунд
3) доделать рандомные цвета
4) записывать состояние для мута и анмута
5) сделать функционал бана
*/