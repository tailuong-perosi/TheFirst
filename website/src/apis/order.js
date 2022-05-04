import { get, post, destroy, patch } from './httpClient'

export const apiOrderPromotion = (body) => post('/order/create', body)
export const apiOrderVoucher = (body) => post('/order/create', body)
export const addOrder = (body) => post('/order/create', body)
export const updateOrder = (body,id) => patch(`/order/update/${id}`, body)
export const getOrders = (query) => get('/order', query)
export const deleteOrders = (ids) => destroy('/order/delete', { order_id: ids })
export const getStatusOrder = () => get('/enum/order')
