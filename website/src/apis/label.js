import { get, post } from './httpClient'

export const getAllLabel = () => get('/label')
export const addLabel = (body) => post('/label/create', body)
