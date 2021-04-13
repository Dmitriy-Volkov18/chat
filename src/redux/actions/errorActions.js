import errorTypes from "../types/errorTypes"

export const error = (err) => ({
    type: errorTypes.ERROR,
    payload: err
})