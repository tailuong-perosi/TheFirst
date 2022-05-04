import io from 'socket.io-client'

export const socket = io(`https://${process.env.REACT_APP_HOST}`)
