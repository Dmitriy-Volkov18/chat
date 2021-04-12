import userTypes from '../types/userTypes'

const initialState = {
    users: null,
    isLoading: false,
    error: null
}

const allUsersReducer = (state = initialState, action) => {
    switch(action.type){
        case userTypes.FETCH_USERS_START:
            return {...state, isLoading: true}
        case userTypes.FETCH_USERS_SUCCESS:
            return {...state, users: action.payload, isLoading: false, error: null}
        case userTypes.FETCH_USERS_FAILURE:
            return {...state, users: null, error: action.payload}
        default:
            return state
    }
}

export default allUsersReducer