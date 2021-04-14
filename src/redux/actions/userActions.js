import userTypes from '../types/userTypes'
import {setAlert} from "./errorActions"
import axios from "axios"


export const login_start = () => ({
    type: userTypes.LOGIN_START
})

export const login_success = (user) => ({
    type: userTypes.LOGIN_SUCCESS,
    payload: user
})

export const login_failure = (error) => ({
    type: userTypes.LOGIN_FAILURE,
    payload: error
})

export const logout = () => ({
    type: userTypes.LOGOUT
})

export const set_admin = (admin) => ({
    type: userTypes.SET_ADMIN,
    payload: admin
})

export const fetch_users_start = () => ({
    type: userTypes.FETCH_USERS_START
})

export const fetch_users_success = (users) => ({
    type: userTypes.FETCH_USERS_SUCCESS,
    payload: users
})

export const fetch_users_failure = (error) => ({
    type: userTypes.FETCH_USERS_FAILURE,
    payload: error
})

export const loginUser = (userData) => async(dispatch) => {
    try{
        dispatch(login_start())

        let response = await axios.post("http://localhost:5000/api/users/signup",  JSON.stringify(userData), {headers: {
                    'Content-Type': 'application/json'
                }})

        const data = await response.data
        const user = data.user
        const admin = data.isAdmin
        const token = data.token

        dispatch(login_success({token, user}))
        dispatch(set_admin(admin))
        
        
    }catch(err){
        const errors = err.response.data.errors
        dispatch(login_failure(errors))

        if(errors){
            errors.forEach(error => {
                dispatch(setAlert(error.msg, "danger"))
            });
        }
    }
}

export const getUser = () => async(dispatch, getState) => {
    try{
        dispatch(login_start())

        const token = getState().user.token

        
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

        let response = await axios.get("http://localhost:5000/api/auth/user", config)
        const data = await response.data
        const user = data.user
        const admin = data.isAdmin
        dispatch(login_success({token, user}))
        dispatch(set_admin(admin))
    }catch(err){
        dispatch(login_failure(err))
    }
}

export const getAllUsers = () => async(dispatch, getState) => {
    try{
        dispatch(fetch_users_start())

        const token = getState().user.token

        
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

        let response = await axios.get("http://localhost:5000/api/users/getAllUsers", config)
        const data = await response.data
        const users = data.users
        dispatch(fetch_users_success(users))
    }catch(err){
        dispatch(fetch_users_failure(err))
    }
}

