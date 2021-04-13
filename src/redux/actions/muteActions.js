import {ISMUTED} from "../types/muteTypes"


export const mute = (isMuted) => ({
    type: ISMUTED,
    payload: isMuted
})