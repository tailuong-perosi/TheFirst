import React from 'react'

import { Row, Affix } from 'antd'

export default function TitlePage({ children, title = '', isAffix = false, top = 56 }) {
  return isAffix ? (
    <Affix offsetTop={top}>
      <Row
        wrap={false}
        align="middle"
        justify="space-between"
        style={{
          borderBottom: '1px solid rgb(235, 223, 223)',
          paddingBottom: '1rem',
          paddingTop: 5,
          backgroundColor: 'white',
        }}
      >
        <h3 style={{ fontSize: 19, marginBottom: 0 }}>{title}</h3>
        {children}
      </Row>
    </Affix>
  ) : (
    <Row
      wrap={false}
      align="middle"
      justify="space-between"
      style={{
        borderBottom: '1px solid rgb(235, 223, 223)',
        paddingBottom: '1rem',
        paddingTop: 5,
        backgroundColor: 'white',
      }}
    >
      <h3 style={{ fontSize: 19, marginBottom: 0 }}>{title}</h3>
      {children}
    </Row>
  )
}
