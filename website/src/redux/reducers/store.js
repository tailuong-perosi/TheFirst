import { ACTION } from 'consts/index'

const initialState = []
var store = (state = initialState, action) => {
  switch (action.type) {
    case ACTION.GET_STORE: {
      state = [{ data: action.data }, { selectValue: action.data[0].store_id }]
      return [...state]
    }
    case ACTION.SELECT_VALUE: {
      var array = [...state]
      array[1].selectValue = action.data
      return [...array]
    }
    default:
      return state
  }
}
export default store
