import { combineReducers } from 'redux'
import login from './login.js'
import store from './store.js'
import branch from './branch.js'
import invoice from './invoice.js'
import setting from './setting.js'
const rootReducers = combineReducers({ login, store, branch, invoice, setting })
export default rootReducers
