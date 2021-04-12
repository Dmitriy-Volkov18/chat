import React, {useState, useEffect, useRef} from 'react'
import { io } from "socket.io-client";
import Message from '../Message/Message'
import AllUsers from '../AllUsers/AllUsers'
import "./Chat.styles.css"
import {useDispatch, useSelector} from "react-redux"
import {logout} from "../../redux/actions/userActions"
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

    // const chatRoomName = "chatRoom"

    const dispatch = useDispatch()

    useEffect(() => {
        if(token){
            const payload = JSON.parse(atob(token.split(".")[1]))
            setUserId(payload)
        }
        socketRef.current = io("http://localhost:5000", {
            auth: {token}
        });

        socketRef.current.on("message", (msg) => {
            setMessages(m => [...m, msg])
        })

        socketRef.current.on("newMessage", (message) => {
            setNewMessages([...newMessages, message])
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
        {css: { color: '#61FF4F' }},
        {css: { color: '#F5EE4C' }},
        {css: { color: '#4CF5AB' }},
        {css: { color: '#FF4FDF' }},
        {css: { color: '#8C414F' }},
        {css: { color: '#418C6D' }},
        {css: { color: '#4CD8F5' }},
        {css: { color: '#F55343' }},
        {css: { color: '#F61D19' }},
        {css: { color: '#2C418F' }}
    ]

    let randomColor = Math.floor(Math.random() * colors.length)


    const leaveTheChat = () => {
        socketRef.current.disconnect()
        dispatch(logout())
    }


    return (
        <div className="chat_container">
            <h1>Welcome to the chat</h1>
            
            <div className="chat-ui">
                <div className="online-users-container">
                    <h2>Online users</h2>
                    <ul>
                        {
                            onlineUsers.map((onlineUser, index) => (
                                <li key={index}>{onlineUser}</li>
                            ))
                        }
                    </ul>
                </div>

                <div className="chat-block">
                    <div className="chat-header">
                        <button onClick={leaveTheChat}>Leave the chat</button>
                    </div>

                    <div className="chat-body-block">
                        {
                            messages.map((message, index) => 
                                (<Message key={index} message={message} />)
                            ) 
                        }

                        {
                            fetchedAllMessages.map((message, index) => 
                                (<Message key={index} message={message} specificClass={userId.id === message.userId ? "currentUser" : "anotherUser"} currentUser={userId.id === message.userId ? true : false} color1={colors[randomColor].css} />)
                            ) 
                        }

                        {
                            newMessages.map((message, index) => 
                                (<Message key={index} message={message} specificClass={userId.id === message.userId ? "currentUser" : "anotherUser"} currentUser={userId.id === message.userId ? true : false} color1={colors[randomColor].css} />)
                            ) 
                        }

                    </div>

                    <div className="form-block">
                        <textarea name="userMessage" ref={messageRef} placeholder="Type a message 1 to 200 characters" />
                        <button onClick={(e) => handleSendMessage(e)}>Send</button> 
                    </div>
                </div>

                {
                    isAdmin && (<AllUsers isAdmin={isAdmin} />)
                }
            </div>
        </div>
    )
}



export default Chat
