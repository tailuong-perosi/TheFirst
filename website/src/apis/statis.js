import { get } from './httpClient'
export const getStatistical = (query) => get('/statistic/overview/order', query)
export const getStatisticalChart = (query) => get('/statistic/overview/chart', query)
export const getStatisticalProduct = (query) => get('/statistic/overview/top-sell', query)
