import errorTypes from '../types/errorTypes'

const initialState = []

const errorReducer = (state = initialState, action) => {
    switch(action.type){
        case errorTypes.ERROR:
            return [...state, action.payload]
        case errorTypes.REMOVE_ERROR:
            return state.filter(error => error.id !== action.payload)
        default:
            return state
    }
}

export default errorReducer