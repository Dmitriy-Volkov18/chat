import {ISMUTED} from '../types/muteTypes'

const initialState = {
    isMuted: false
}

const muteReducer = (state = initialState, action) => {
    switch(action.type){
        case ISMUTED:
            return {...state, isMuted: action.payload}
        default:
            return state
    }
}

export default muteReducer