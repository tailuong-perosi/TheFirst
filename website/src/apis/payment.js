import { get, post, patch, destroy } from './httpClient'

export const getPayments = (params) => get('/payment', params)
export const addPayment = (body) => post('/payment/create', body)
export const editPayment = (body, id) => patch(`/payment/update/${id}`, body)
export const deletePayment = (id) => destroy('/payment/delete', { payment_method_id: id })
