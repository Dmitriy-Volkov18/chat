import React from 'react'
import "./Message.styles.css"

const Message = ({message, specificClass}) => {
    return (
        <div>
            <h4 className={`${specificClass}`}>{message.message}</h4>
        </div>
    )
}

export default Message
