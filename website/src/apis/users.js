import { get } from './httpClient'

export const getUsers = (query) => get('/user', query)
