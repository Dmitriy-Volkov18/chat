import React from 'react'
import "./Message.styles.css"
import moment from "moment"

const Message = ({message, specificClass, color1, currentUser}) => {
    if(message instanceof Object){
        return (
            <div className={`${specificClass}`} >
                <p className="msgUsername">{currentUser ? "You" : message.username} - <span className="date">{moment(message.date).fromNow()}</span></p>
                <p className="msgText" style={color1}>{message.message}</p>
            </div>
        )
    }else{
        return (
            <div className="serverMessage" >
                <p className="msgText">{message}</p>
            </div>
        )
    }
    
}

export default Message
