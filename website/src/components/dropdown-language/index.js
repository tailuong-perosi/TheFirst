import React, { useState } from 'react'
import { CarretDown } from 'utils/icon'

//language
import { useTranslation } from 'react-i18next'
import { changeLanguage } from 'utils'

//antd
import { Dropdown, Menu } from 'antd'

export default function DropdownLanguage() {
  const { t } = useTranslation()
  const [appLanguage, setAppLanguage] = useState('vi')

  const LanguageDropdown = () => (
    <Menu>
      <Menu.Item
        icon={
          <img
            alt=""
            src="https://admin-order.s3.ap-northeast-1.wasabisys.com/2021/12/08/88294930-deff-4371-866d-ca2e882f24f8/1f1fb-1f1f3.png"
            width="28"
          />
        }
        onClick={() => {
          changeLanguage('vi')
          setAppLanguage('vi')
        }}
      >
        {t('login.vi')}
      </Menu.Item>
      <Menu.Item
        icon={
          <img
            alt=""
            src="https://admin-order.s3.ap-northeast-1.wasabisys.com/2021/12/08/14065773-9bee-46ea-8ee5-26e87cdb01b8/1f1ec-1f1e7.png"
            width="28"
          />
        }
        onClick={() => {
          changeLanguage('en')
          setAppLanguage('en')
        }}
      >
        {t('login.en')}
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={<LanguageDropdown />} placement="bottomCenter" trigger="click">
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginRight: 5 }}>
        <div>
          {appLanguage === 'vi' ? (
            <img
              alt=""
              src="https://admin-order.s3.ap-northeast-1.wasabisys.com/2021/12/08/88294930-deff-4371-866d-ca2e882f24f8/1f1fb-1f1f3.png"
              width="28"
            />
          ) : (
            <img
              alt=""
              src="https://admin-order.s3.ap-northeast-1.wasabisys.com/2021/12/08/14065773-9bee-46ea-8ee5-26e87cdb01b8/1f1ec-1f1e7.png"
              width="28"
            />
          )}
        </div>
        <div style={{ color: '#fff', minWidth: 90, marginLeft: 7, fontSize: 15 }}>
          {appLanguage === 'vi' ? t('login.vi') : t('login.en')} <CarretDown />
        </div>
      </div>
    </Dropdown>
  )
}
