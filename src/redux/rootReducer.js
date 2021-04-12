import {combineReducers, applyMiddleware, createStore} from 'redux'
import userReducer from "./reducers/userReducer"
import allUsersReducer from "./reducers/allUsersReducer"
import thunk from 'redux-thunk'
import logger from "redux-logger"

const middlewares = [logger, thunk]

const rootReducer = combineReducers({
    user: userReducer,
    allUsers: allUsersReducer
})

const store = createStore(rootReducer, applyMiddleware(...middlewares))

export default store