import { get, patch, post, destroy } from './httpClient'

export const getDeals = (query) => get('/deal/get', query)
export const addDeal = (body) => post('/deal/create', body)
export const updateDeal = (body, id) => patch(`/deal/update/${id}`, body)
export const updateDealsPrice = (body) => patch('/deal/updatesaleofvalue', body)
export const deleteDeal = (id) => destroy(`/deal/delete?deal_id=${id}`)
