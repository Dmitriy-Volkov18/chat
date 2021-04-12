import React, {useEffect} from 'react'
import {useSelector, connect} from "react-redux"
import {getAllUsers} from "../../redux/actions/userActions"


const AllUsers = ({getAllUsers, isAdmin}) => {
    const allUsers = useSelector(state => state.allUsers.users)
    const isLoading = useSelector(state => state.allUsers.isLoading)

    useEffect(() => {
        if(isAdmin) getAllUsers()
    }, [isAdmin, getAllUsers])

    return (
        <div className="allUsers-container">
            <h2>All users</h2>
            <ul>
                {
                    (!isLoading && allUsers)  ? (
                        allUsers.map((user, index) => (
                            <li key={index}><span><button className="banBtn">Ban</button><button className="unbanBtn">Unban</button><button className="muteBtn">Mute</button><button className="unmuteBtn">Unmute</button></span>{user.username}</li>
                        ))
                    ) : <h2>No users found</h2>
                }
            </ul>
        </div>
    )
}

const mapDispatchToProps = dispatch => ({
    getAllUsers: () => dispatch(getAllUsers())
})

export default connect(null, mapDispatchToProps)(AllUsers)
