import React, {useState} from 'react'
import {useDispatch, useSelector} from "react-redux"
import {Redirect} from "react-router-dom"
import {loginUser} from "../../redux/actions/userActions"

const Login = () => {
    const [formValue, setFormValue] = useState({
        username: "",
        email: "",
        password: ""
    })

    const dispatch = useDispatch()
    const currentUser = useSelector(state => state.user.currentUser)

    const {username, email, password} = formValue

    const onChange = (e) => {
        const {name, value} = e.target
        setFormValue({...formValue, [name]: value})
    }

    const onSubmit = async(e) => {
        e.preventDefault()

        if(username !== "" && email !== "" && password !== ""){
            dispatch(loginUser(formValue))
        }
    }


    return (
        currentUser ? (<Redirect to="/" />) : 
        (
            <div className="login">
                <form method="post" onSubmit={(e) => onSubmit(e)}>
                    <input type="text" name="username" value={username} onChange={(e) => onChange(e)} placeholder="enter a username" required/>
                    <input type="email" name="email" value={email} onChange={(e) => onChange(e)} placeholder="enter a email" required/>
                    <input type="password" name="password" value={password} onChange={(e) => onChange(e)} placeholder="enter a password" required/>
                    <input type="submit" value="Send"/>
                </form>
            </div>
        )
    )
}

export default Login
