import {combineReducers, applyMiddleware, createStore} from 'redux'
import userReducer from "./reducers/userReducer"
import allUsersReducer from "./reducers/allUsersReducer"
import errorReducer from "./reducers/errorReducer"
import muteReducer from "./reducers/muteReducer"


import thunk from 'redux-thunk'
import logger from "redux-logger"

const middlewares = [logger, thunk]

const rootReducer = combineReducers({
    user: userReducer,
    allUsers: allUsersReducer,
    errors: errorReducer,
    mute: muteReducer
})

const store = createStore(rootReducer, applyMiddleware(...middlewares))

export default store