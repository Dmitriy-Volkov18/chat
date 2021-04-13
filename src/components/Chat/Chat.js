import React, {useState, useEffect, useRef} from 'react'
import { io } from "socket.io-client";
import Message from '../Message/Message'
import AllUsers from '../AllUsers/AllUsers'
import "./Chat.styles.css"
import {useSelector} from "react-redux"
import axios from "axios"

const Chat = () => {
    const socketRef = useRef();
    // const [messages, setMessages] = useState([])
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

        // socketRef.current.on("message", (msg) => {
        //     setMessages(m => [...m, msg])
        // })

        socketRef.current.on("newMessage", (message) => {
            setNewMessages([...newMessages, message])
            console.log(chat_body_ref)
        })


        socketRef.current.emit("joinRoom", "chatRoom")

        socketRef.current.on("fetchOnlineUsers", (onlineUser) => {
            console.log(onlineUser)
            setOnlineUsers(onlineUser)
        })

        return () => {
            socketRef.current.emit("leaveRoom", "chatRoom")
            socketRef.current.close()
        }
    }, [newMessages, token])


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


    const isMuted = useSelector(state => state.mute.isMuted)
    const [mute, setMute] = useState(false)
    

    useEffect(() => {
        setMute(isMuted)
        messageRef.current.disabled = isMuted
    }, [isMuted])


    //////////////////////////////////
    
    const handleSendMessage = async (e) => {
        if(messageRef.current.value === "") return
        
        const timer = ms => new Promise(res => setTimeout(res, ms))
        async function load() { 
            socketRef.current.emit("chatRoomMessage", {
                chatRoom: "chatRoom",
                message: messageRef.current.value
            })

            messageRef.current.value = ""

            await timer(3000);
        }

        load()
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

    let randomColor = Math.floor(Math.random() * colors.length)

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
                            Object.values(onlineUsers).map((onlineUser, index) => (
                                <li key={index} style={colors[Math.floor(Math.random() * colors.length)]}>{onlineUser}</li>
                            ))
                        }
                    </ul>
                </div>

                <div className="chat-block">
                    <div className="chat-header"></div>

                    <div className="chat-body-block" ref={chat_body_ref}>
                        {/* {
                            messages.map((message, index) => 
                                (<Message key={index} message={message} />)
                            ) 
                        } */}

                        {
                            fetchedAllMessages.map((message, index) => 
                                (<Message key={index} message={message} specificClass={userId.id === message.userCreated ? "currentUser" : "anotherUser"} currentUser={userId.id === message.userCreated ? true : false} color1={colors[Math.floor(Math.random() * colors.length)]} />)
                            ) 
                        }

                        {
                            newMessages.map((message, index) => 
                                (<Message key={index} message={message} specificClass={userId.id === message.userId ? "currentUser" : "anotherUser"} currentUser={userId.id === message.userId ? true : false} color1={colors[Math.floor(Math.random() * colors.length)]} />)
                            ) 
                        }

                    </div>

                    <div className="form-block">
                        <textarea name="userMessage" ref={messageRef} placeholder={`${mute ? "You`ve been muted" : "Type a message 1 to 200 characters"}`} disabled={mute} />
                        <button onClick={(e) => handleSendMessage(e)}>Send</button> 
                    </div>
                </div>

                {
                    isAdmin && (<AllUsers socket={socketRef} />)
                }
            </div>
        </div>
    )
}



export default Chat
