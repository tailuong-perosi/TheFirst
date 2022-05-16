import { get} from './httpClient'

// export const getshopping = (query) => get (`shoppingdairy/`, query)
export const getshopping = (body, phone) => get (`shoppingdairy/${phone}`, body)

export const getshoppingone = ( business_prefix, orderId) => get (`shoppingdairy/check/${business_prefix}/${orderId}`)
