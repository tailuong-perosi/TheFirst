import { post, get, patch } from './httpClient'

export const register = (body) => post('/userEKT/register', body)
export const login = (body, headers) => post('userEKT/login', body, headers)
export const verify = (body) => post('/userEKT/verifyotp', body)
export const getOtp = (phone) => post('/userEKT/getotp', { phone })
export const checkBusiness = (phone) => post('/userEKT/check-business', { phone })
export const checkLink = (body) => post('/authorization/checkverifylink', body)

export const getuserEKT = (query) => get('userEKT', query)
export const updateuserEKT = (body, id) => patch(`/userEKT/update/${id}`, body)




export const resetPassword = (body) => post('/userEKT/recoverypassword', body)
export const refresh = (body) => post('/userEKT/refreshtoken', body)
