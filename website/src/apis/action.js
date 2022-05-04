import { get, post } from './httpClient'

export const getActions = (query) => get('/action', query)
export const getFileHistory = (params) => get('/action/file-history', params)
export const createFileHistory = (body) => post('/action/file-history/create', body)
export const getActionLayouts = () => get('/action/menu-system')
