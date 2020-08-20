import { createContext } from 'react'

const Context = createContext({
    currentUser: null,
    isAuth: false,
    draftPin: null,
    pins: [],
    currentPin: null
})

export default Context