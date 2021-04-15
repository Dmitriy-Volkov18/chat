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

        socketRef.current.on("newMessage", (message) => {
            setNewMessages([...newMessages, message])
            lastMessage.current = message
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
            if(isBannedRef.current){
                dispatch(logout())
            }
        })
    }, [])


    
    const handleSendMessage = () => {
        if(messageRef.current.value === "") return

        socketRef.current.emit("chatRoomMessage", {
            chatRoom: "chatRoom",
            message: messageRef.current.value
        })

        messageRef.current.value = ""

        // console.log(lastMessage.current)

        // if(lastMessage.current){
        //     if(new Date(lastMessage.current.date).getTime() > new Date(lastMessage.current.date).getTime() + 15000){
        //         socketRef.current.emit("chatRoomMessage", {
        //             chatRoom: "chatRoom",
        //             message: messageRef.current.value
        //         })
        
        //         messageRef.current.value = ""
        //         console.log("more")
        //     }else{
        //         console.log("less")
        //     }
        // }
    }


    return (
        
            <div className="chat_container">
            <h1>Welcome to the chat</h1>
            
            <div className="chat-ui">
                <div className="online-users-container">
                    <h2>Online users</h2>
                    <ul>
                        {
                            Object.values(onlineUsers).map((onlineUser, index) => {
                                    return <li key={index} style={colorsRef.current[randomColor]}>{onlineUser}</li>
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
                                (<Message key={index} message={message} specificClass={userId.id === message.userCreated ? "currentUser" : "anotherUser"} currentUser={userId.id === message.userCreated ? true : false} color1={colorsRef.current[Math.floor(Math.random() * colors.length)]} />)
                            ) 
                        }
                        {
                            messages.map((message, index) => 
                                (<Message key={index} message={message} />)
                            ) 
                        }
                        {
                            newMessages.map((message, index) => {
                                    return <Message key={index} message={message} specificClass={userId.id === message.userId ? "currentUser" : "anotherUser"} currentUser={userId.id === message.userId ? true : false} color1={colorsRef.current[randomColor]} />
                                }
                            ) 
                        }
                    </div>

                    <div className="form-block">
                        <textarea name="userMessage" ref={messageRef} placeholder={`${mute ? "You`ve been muted" : "Type a message 1 to 200 characters"}`}/>
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

// ОСТАЛОСЬ СДЕЛАТЬ

/*  
2) сделать отправку сообщений через каждые 15 секунд
3) доделать рандомные цвета
*/
