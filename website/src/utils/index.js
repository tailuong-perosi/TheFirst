import { VERSION_APP } from 'consts'
import { message } from 'antd'
import i18n from 'locales/i18n.js'
import CryptoJS from 'crypto-js'

export const changeLanguage = (language) => {
  i18n.changeLanguage(language)
  localStorage.setItem('language', language)
}

export const validatePhone = (phone = '') => {
  const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g
  if (vnf_regex.test(phone)) return true
  return false
}

export const compare = (a, b, key, convert) => {
  if (convert)
    return convert(a[key]) > convert(b[key]) ? 1 : convert(a[key]) === convert(b[key]) ? 0 : -1
  return a[key] > b[key] ? 1 : a[key] === b[key] ? 0 : -1
}

export const compareCustom = (a, b) => {
  return a > b ? 1 : a === b ? 0 : -1
}

export const tableSum = (arr, key) => {
  const getValue = (obj, key) => {
    try {
      return key.split('.').reduce((a, b) => {
        return a[b] || 0
      }, obj)
    } catch (e) {
      return 0
    }
  }
  try {
    return arr.reduce((a, b) => a + parseInt(getValue(b, key)), 0)
  } catch (err) {
    console.log(err)
    return 0
  }
}

export function formatCash(str) {
  if (str) return (str + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  else return 0
}

export function removeNull(a) {
  return Object.keys(a)
    .filter((key) => a[key] !== '' && a[key] !== undefined)
    .reduce((res, key) => ((res[key] = a[key]), res), {})
}

//xoá dấu
export function removeAccents(text, removeSpace = false) {
  if (removeSpace && typeof removeSpace != 'boolean') {
    throw new Error('Type of removeSpace input must be boolean!')
  }
  text = (text + '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
  if (removeSpace) {
    text = text.replace(/\s/g, '')
  }
  return text
}

export const clearBrowserCache = () => {
  let version = localStorage.getItem('version_app')
  if (version !== VERSION_APP) {
    if ('caches' in window) {
      caches.keys().then((names) => {
        // Delete all the cache files
        names.forEach((name) => {
          caches.delete(name)
        })
      })

      // Makes sure the page reloads. Changes are only visible after you refresh.
      window.location.reload(true)
    }

    localStorage.clear()
    localStorage.setItem('version_app', VERSION_APP)
  }
}

export const copyText = (text) => {
  navigator.clipboard.writeText(text)
  message.success('Copied the text')
}

export const encryptText = (text) =>
  CryptoJS.AES.encrypt(text, process.env.REACT_APP_SECRET_KEY_CRYPTO).toString()

export const decryptText = (cipherText) => {
  var bytes = CryptoJS.AES.decrypt(cipherText, process.env.REACT_APP_SECRET_KEY_CRYPTO)
  var originalText = bytes.toString(CryptoJS.enc.Utf8)
  return originalText || ''
}
