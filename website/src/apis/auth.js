import { post } from './httpClient'

export const register = (body) => post('/authorization/register', body)
export const login = (body, headers) => post('/authorization/login', body, headers)
export const checkLink = (body) => post('/authorization/checkverifylink', body)
export const verify = (body) => post('/authorization/verifyotp', body)
export const getOtp = (username) => post('/authorization/getotp', { username })
export const resetPassword = (body) => post('/authorization/recoverypassword', body)
export const checkBusiness = (username) => post('/authorization/check-business', { username })
export const refresh = (body) => post('/authorization/refreshtoken', body)
