import React, {useState, useEffect, useRef} from 'react'
import { io } from "socket.io-client";
import Message from '../Message/Message'
import AllUsers from '../AllUsers/AllUsers'
import "./Chat.styles.css"
import {useDispatch, useSelector} from "react-redux"
import {logout} from "../../redux/actions/userActions"



const Chat = () => {
    const socketRef = useRef();
    const [messages, setMessages] = useState([])
    const [onlineUsers, setOnlineUsers] = useState([])
    const [newMessages, setNewMessages] = useState([])
    const [userId, setUserId] = useState("")

    const messageRef = useRef()

    const token = useSelector(state => state.user.token)
    const isAdmin = useSelector(state => state.user.isAdmin)



    const [color, setColor] = useState("")

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
    
    const handleSendMessage = () => {
        socketRef.current.emit("chatRoomMessage", {
            chatRoom: "chatRoom",
            message: messageRef.current.value
        })

        messageRef.current.value = ""
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

    const leaveTheChat = () => {
        socketRef.current.disconnect(0)
        dispatch(logout())
    }

    function getRandomColor(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        let rand_value = Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
        return colors[rand_value].css
    }


    return (
        <div className="chat">
            <div className="online-users">
                <ul>
                    {
                        onlineUsers.map((onlineUser, index) => (
                            <li key={index}>{onlineUser}</li>
                        ))
                    }
                </ul>
            </div>

            <button onClick={leaveTheChat}>Leave the chat</button>

            {
                messages.map((message, index) => 
                    (<Message key={index} message={message} />)
                ) 
            }

            {
                newMessages.map((message, index) => 
                    (<Message key={index} message={message} specificClass={userId.id === message.userId ? "currentUser" : "anotherUser"} color1={colors[Math.floor(Math.random() * colors.length)].css} />)
                ) 
            }


            <textarea name="userMessage" ref={messageRef} placeholder="Type a message" />
            <button onClick={handleSendMessage}>Send</button> 

            {
                isAdmin && (<AllUsers isAdmin={isAdmin} />)
            }
            


        </div>
    )
}



export default Chat
