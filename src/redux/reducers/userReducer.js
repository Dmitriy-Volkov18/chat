import userTypes from '../types/userTypes'

const initialState = {
    token: localStorage.getItem("token"),
    currentUser: null,
    isAdmin: false,
    isLoggedIn: false,
    error: null
}

const userReducer = (state = initialState, action) => {
    switch(action.type){
        case userTypes.LOGIN_SUCCESS:
            localStorage.setItem("token", action.payload.token)
            return {...state, token: action.payload.token, currentUser: action.payload.user, isLoggedIn: true, error: null}
        case userTypes.SET_ADMIN:
            return {...state, isAdmin: action.payload}
        case userTypes.LOGIN_FAILURE:
            return {...state, currentUser: null, isLoggedIn: false, error: action.payload}
        case userTypes.LOGOUT:
            localStorage.removeItem("token")
            return {...state, token: null, currentUser: null, isLoggedIn: false, error: null, isAdmin: false}
        default:
            return state
    }
}

export default userReducer