import React from 'react'
import "./Message.styles.css"

const Message = ({message, specificClass, color1}) => {
    return (
        <div>
            <h4 className={`${specificClass}`} style={color1}>{message.message}</h4>
        </div>
    )
}

export default Message
