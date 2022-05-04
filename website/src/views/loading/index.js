import React from 'react'

import { LoadingOutlined } from '@ant-design/icons'

export default function Loading() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <LoadingOutlined style={{ color: '#5B6BE8', fontSize: 70 }} />
    </div>
  )
}
