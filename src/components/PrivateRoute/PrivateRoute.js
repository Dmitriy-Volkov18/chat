import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import {useSelector} from "react-redux"

const PrivateRoute = ({component: Component, ...rest}) => {
    const currentUser = useSelector(state => state.user.currentUser)

    return (
        <Route {...rest} render={props => !currentUser ? (<Redirect to='/login'/>) : (<Component {...props} />)} />
    )
}
export default PrivateRoute
