import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from "react-redux"
import {mute} from "../../redux/actions/muteActions"
import axios from "axios"

const AllUsers = ({getAllUsers, socket, callback}) => {
    const token = useSelector(state => state.user.token)
    const [fetchAllUsers, setFetchAllUsers] = useState([])

    useEffect(() => {
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

        axios.get("http://localhost:5000/api/users/getAllUsers", config)
        .then(response => response.data)
        .then(data => {
            socket.current.emit("fetchAllUsers", data.users)
        })
        
        socket.current.on("fetchAllUsers", (users) => {
            setFetchAllUsers(users)
        })
    })

    const banUser = () => {
        console.log("banned")
    }

    const unbanUser = () => {
        console.log("unbanned")
    }

    const muteUser = (username) => {
        socket.current.emit("muteUserUsername", username)

        socket.current.on("muteUserUsername", (trueValue) => {
            callback(trueValue)
        })

    }

    const unmuteUser = (username) => {
        socket.current.emit("unMuteUserUsername", username)

        // socket.current.on("unmuteUser", (muteObj) => {
        //     dispatch(mute(muteObj))
        // })
    }

    return (
        <div className="allUsers-container">
            <h2>All users</h2>
            <ul>
                {
                    fetchAllUsers ? (
                        fetchAllUsers.map((user, index) => (
                            <li key={index}><span><button className="banBtn" onClick={banUser}>Ban</button><button className="unbanBtn" onClick={unbanUser}>Unban</button><button className="muteBtn" onClick={() => muteUser(user.username)}>Mute</button><button className="unmuteBtn" onClick={() => unmuteUser(user.username)}>Unmute</button></span>{user.username}</li>
                        ))
                    ) : <h3>No users found</h3>
                }
            </ul>
        </div>
    )
}

export default AllUsers
