import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from "react-redux"
// import {getAllUsers} from "../../redux/actions/userActions"
import {mute} from "../../redux/actions/muteActions"
import axios from "axios"

const AllUsers = ({getAllUsers, socket}) => {
    // const allUsers = useSelector(state => state.allUsers.users)
    // const isLoading = useSelector(state => state.allUsers.isLoading)
    const token = useSelector(state => state.user.token)

    const [fetchAllUsers, setFetchAllUsers] = useState([])

    // useEffect(() => {
    //     getAllUsers()

    //     if(!isLoading && allUsers){
    //         socket.current.emit("fetchAllUsers", allUsers)
    //     }

    //     socket.current.on("fetchAllUsers", (users) => {
    //         setFetchAllUsers(users)
    //     })

        
    // }, [getAllUsers, socket, isLoading, allUsers])
    

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


    const [isMuted, setIsMuted] = useState(false)
    const dispatch = useDispatch()
    

    const banUser = () => {
        console.log("banned")
    }

    const unbanUser = () => {
        console.log("unbanned")
    }

    const muteUser = (username) => {
        socket.current.emit("muteUserUsername", username)

        socket.current.on("muteUser", (trueValue) => {
            setIsMuted(trueValue)
            dispatch(mute(trueValue))
        })
    }

    const unmuteUser = (username) => {
        socket.current.emit("unMuteUserUsername", username)

        socket.current.on("unmuteUser", (trueValue) => {
            setIsMuted(trueValue)
            dispatch(mute(trueValue))
        })
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
            {isMuted ? "muted" : "no"}
        </div>
    )
}

// const mapDispatchToProps = dispatch => ({
//     getAllUsers: () => dispatch(getAllUsers())
// })

export default AllUsers
// export default connect(null, mapDispatchToProps)(AllUsers)




/*
компонент Все Юзеры не могут содержать в себе кнопки действий потому что
1) Как мне узнать id юзера если он не подключён к чату




*/