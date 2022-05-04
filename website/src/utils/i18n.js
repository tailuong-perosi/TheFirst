import locales from 'locales'

const configs = {
  //check xem web đang ở chuyên đổi ngôn ngữ nào, mặc định là tiếng việt
  language: sessionStorage.getItem('language')
    ? JSON.parse(sessionStorage.getItem('language'))
    : 'vi',
}

export const getLanguage = () => configs.language

export const setLanguage = (_language) => {
  if (locales[_language]) {
    configs.language = _language
  }
  sessionStorage.setItem('language', JSON.stringify(_language))
  window.location.reload()
}

export const translate = (text, ...values) => {
  const _locales = locales[configs.language]
  let indexValue = 0

  if (!text) {
    return text
  }

  if (_locales[text] && _locales[text].trim() !== '') {
    return _locales[text].replace(
      /\{value\}/gi,
      () => values[indexValue++] || ''
    )
  }
  return text.replace(/\{value\}/gi, () => values[indexValue++] || '')
}
