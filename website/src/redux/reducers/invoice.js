const initialState = {
  invoices: [],
}
const invoice = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_INVOICE':
      const invoicesNew = [...action.data]
      return { ...state, invoices: invoicesNew }

    default:
      return state
  }
}

export default invoice
