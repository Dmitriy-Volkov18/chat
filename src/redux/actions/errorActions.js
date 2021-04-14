import errorTypes from "../types/errorTypes"
import { v4 as uuidv4 } from 'uuid';

export const setError = (err) => ({
    type: errorTypes.ERROR,
    payload: err
})


export const removeError = (id) => ({
    type: errorTypes.REMOVE_ERROR,
    payload: id
})


export const setAlert = (msg, alertType, timeout = 3000) => dispatch => {
    const id = uuidv4()
    
    dispatch(setError({msg, alertType, id}))

    setTimeout(() => dispatch(removeError(id)), timeout)
}