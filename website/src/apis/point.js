import { get, patch } from './httpClient'
export const getPoint = (query) => get('/pointsetting', query)
export const updatePoint = (body) => patch('/pointsetting/update/1', body)
