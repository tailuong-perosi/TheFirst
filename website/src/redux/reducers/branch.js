let initialState = {
  branchId: '',
  trigger: false,
}

const branch = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_BRANCH_ID': {
      return { ...state, branchId: action.data || '' }
    }

    case 'TRIGGER_RELOAD_BRANCH': {
      return { ...state, trigger: !state.trigger }
    }

    default:
      return state
  }
}

export default branch
