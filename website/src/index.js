import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import './custom-antd.css'
import 'chartkick/chart.js'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'
import 'antd/dist/antd.less'
import viVN from 'antd/lib/locale/vi_VN'
import i18n from './locales/i18n'
import { I18nextProvider } from 'react-i18next'
import { ConfigProvider } from 'antd'

ReactDOM.render(
  <ConfigProvider locale={viVN}>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <PersistGate loading={<div>loading ...</div>} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </I18nextProvider>
  </ConfigProvider>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
