import { get, patch, post } from './httpClient'

export const getCompare = (query) => get('/compare/getcompare', query)
export const getSession = (query) => get('/compare/getsession', query)
export const addCompare = (data) => post('/compare/addcompare', data)
export const updateCompare = (id, data) => patch('/compare/getcompare', data)
