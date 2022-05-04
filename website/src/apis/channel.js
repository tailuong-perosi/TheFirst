import { get, patch, post, destroy } from './httpClient'

export const getChannels = (params) => get('/channel', params)
export const getPlatform = (params) => get('/channel/platform', params)
export const createChannel = (body) => post('/channel/create', body)
export const updateChannel = (id, body) => patch(`/channel/update/${id}`, body)
export const deleteChannel = (id) => destroy('/channel/delete', id)
