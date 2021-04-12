import React from 'react'
import {useDispatch, useSelector} from "react-redux"
import {Link} from 'react-router-dom'
import {logout} from "../../redux/actions/userActions"

import "./Header.styles.css"

const Header = () => {
    const dispatch = useDispatch()
    const currentUser = useSelector(state => state.user.currentUser)

    const authLinks = (
        <ul>
            <li>
                <Link to="/">Chat</Link>
            </li>
            <li>
                <a href="#!" onClick={() => dispatch(logout())}>Logout</a>
            </li>
        </ul>
    )

    const guestLinks = (
        <ul>
            <li>
                <Link to="/">Chat</Link>
            </li>
            <li>
                <Link to="/login">Login</Link>
            </li>
        </ul>
    )
    return (
        <div className="header">
            {
                currentUser ? authLinks : guestLinks
            }
        </div>
    )
}

export default Header
