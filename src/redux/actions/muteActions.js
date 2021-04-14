import {ISMUTED} from "../types/muteTypes"


export const mute = (muteObj) => ({
    type: ISMUTED,
    payload: muteObj
})