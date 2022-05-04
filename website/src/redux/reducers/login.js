import { ACTION } from 'consts'
import jwt_decode from 'jwt-decode'

// nhận data từ server
const initialState = {
  dataUser: {},
  loading: false,
  username: '',
  objectUsername: {},
  branchName: '',
}
let login = (state = initialState, action) => {
  switch (action.type) {
    case ACTION.LOGIN: {
      if (action.data.accessToken) {
        var data = jwt_decode(action.data.accessToken)

        localStorage.setItem('accessToken', action.data.accessToken)
        localStorage.setItem('refreshToken', action.data.refreshToken)

        return {
          ...state,
          dataUser: data,
          username: data.data.username,
          objectUsername: data.data,
        }
      }

      return {
        ...state,
      }
    }

    case 'UPDATE_DATA_USER': {
      const newDataUser = { ...action.data }
      return {
        ...state,
        dataUser: newDataUser,
      }
    }

    case 'SAVE_BRANCH_NAME': {
      return {
        ...state,
        branchName: action.data || '',
      }
    }

    case ACTION.LOGOUT: {
      localStorage.clear()
      return {
        ...state,
        dataUser: {},
      }
    }
    case ACTION.LOADING: {
      state.loading = action.data
      return state
    }

    default:
      return state
  }
}
export default login
