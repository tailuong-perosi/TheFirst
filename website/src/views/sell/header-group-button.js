import React from 'react'

import { useHistory, Link } from 'react-router-dom'
import { ROUTES } from 'consts'

import ScreenZoom from './screen-zoom'

import { Space, Tooltip } from 'antd'

export default function HeaderGroupButton() {
  const history = useHistory()

  return (
    <Space size="middle" wrap={false}>
      <ScreenZoom />
      <Tooltip title="Đi tới trang quản lý thu chi">
        <Link to={ROUTES.RECEIPTS_PAYMENT} target="_blank">
          <img
            src="https://s3.ap-northeast-1.wasabisys.com/ecom-fulfill/2021/10/16/6cb46f92-43da-4d2e-9ba1-16598b2c9590/notes 1.png"
            alt=""
            style={{ width: 24, height: 24, cursor: 'pointer' }}
          />
        </Link>
      </Tooltip>
      <Tooltip title="Đi tới trang báo cáo bán hàng">
        <img
          src="https://s3.ap-northeast-1.wasabisys.com/ecom-fulfill/2021/10/16/6cb46f92-43da-4d2e-9ba1-16598b2c9590/report 1.png"
          alt=""
          style={{ width: 24, height: 24, cursor: 'pointer' }}
          onClick={() => history.push(ROUTES.SALES_REPORT)}
        />
      </Tooltip>
      <Tooltip title="Quay về trang tổng quan">
        <img
          src="https://s3.ap-northeast-1.wasabisys.com/ecom-fulfill/2021/10/16/6cb46f92-43da-4d2e-9ba1-16598b2c9590/home 1.png"
          alt=""
          style={{ width: 24, height: 24, cursor: 'pointer' }}
          onClick={() => history.push(ROUTES.OVERVIEW)}
        />
      </Tooltip>
    </Space>
  )
}
