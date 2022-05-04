const initialState = {}
const setting = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_SETTING_APP': {
      return { ...action.data }
    }

    default:
      return state
  }
}

export default setting
