import React from 'react'

import { Button } from 'antd'
import { useHistory } from 'react-router-dom'

export default function NotSupportMobile() {
  const history = useHistory()
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: '#5D6FE5',
        zIndex: 99999,
      }}
    >
      <h2 style={{ textAlign: 'center', color: 'white' }}>
        Chức năng này không hỗ trợ thao tác trên điện thoại
      </h2>
      <Button
        type="primary"
        style={{
          backgroundColor: 'black',
          color: 'white',
          borderColor: 'black',
        }}
        onClick={() => history.goBack()}
        size="large"
      >
        Quay lại
      </Button>
    </div>
  )
}
