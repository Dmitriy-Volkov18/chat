import {ISMUTED} from '../types/muteTypes'

const initialState = {}

const muteReducer = (state = initialState, action) => {
    switch(action.type){
        case ISMUTED:
            return {...state, ...action.payload}
        default:
            return state
    }
}

export default muteReducer