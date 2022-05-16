/* eslint-disable jsx-a11y/anchor-is-valid */

// import { PAGE_SIZE } from 'consts'
import React, { useState, useEffect } from 'react'
import styles from './overview.module.scss'
import { Avatar, Button, Table } from 'antd'
import { Row, Col, Timeline, Modal } from 'antd'
import jwt_decode from 'jwt-decode'
import ModalShopping from './modal-shopping'
// import ModalUpdateUser from './modal-user'
import { getuserEKT } from 'apis/userEKT'
import { getshopping, getshoppingone } from 'apis/shopping_dairy'
// import data from 'views/import-report-file/datatest'

function App() {
  const [user, setUser] = useState([])
  const [orderekt, setorderEKT] = useState('')
  const [detailshopping, setDetaishopping] = useState('')

  const dataUser = localStorage.getItem('accessToken')
    ? jwt_decode(localStorage.getItem('accessToken'))
    : {}

  const getInfoUser = async (params) => {
    try {
      const res = await getuserEKT(params)
      if (res.status === 200) {
        if (res.data.data.length) setUser({ ...res.data.data[0] })
        console.log('user', user.phone);
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _getShoppingDari = async (body) => {
    try {
      const resShoppingDari = await getshopping(body, user && user.phone)
      console.log('resShop', resShoppingDari)
      if (resShoppingDari.status === 200) setorderEKT(resShoppingDari.data.data)
    } catch (e) {
      console.log(e)
    }
  }

  const getone = async (business_prefix, orderId) => {
    try {
      const res = await getshoppingone(business_prefix, orderId)
      console.log(res)
      if (res.status === 200) {
        setDetaishopping(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getInfoUser({ user_id: dataUser.data.user_id })
  }, [dataUser.data.user_id])

  useEffect(() => {
    _getShoppingDari()
  }, [])

  return (
    <div className={styles['container-layout']}>
      <div className={styles['container-content']}>
        <Row>
          <Col xs={24} sm={24} md={24} lg={14} xl={14}>
            <div
              style={{ marginRight: 20, marginTop: 0, height: '80%', marginBottom: 15 }}
              className={styles['card-overview']}
            >
              <div className={styles['dashboard_manager_bottom_row_col_parent_top']}>
                <div>Lịch sử mua hàng của bạn</div>
                <Button type="primary" onClick={_getShoppingDari} orderekt={orderekt}>
                  Làm mới
                </Button>
              </div>
              <div style={{ width: '100%', overflowY: 'scroll', paddingTop: 10 }}>
                <Timeline
                  // mode="alternate"
                  style={{
                    marginLeft: 80,
                    marginTop: 20,
                  }}
                >
                  {orderekt &&
                    orderekt.map((Item, index) => {
                      return (
                        <Timeline.Item color="green">
                          <p>Ngày mua: {Item.create_at || 'chưa có thông tin'}</p>
                          <p>Cửa hàng: {Item.business_id || 'chưa có thông tin'}</p>
                          <p>Giá trị đơn hàng: {Item.total_cost || 'chưa có thông tin'}vnđ</p>

                          <ModalShopping detailshopping={detailshopping}>
                            <Button onClick={() => getone(Item.business_prefix, Item.orderId)}>
                              Xem chi tiết
                            </Button>
                          </ModalShopping>
                        </Timeline.Item>
                      )
                    })}
                </Timeline>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={10} xl={10} style={{ marginBottom: 15 }}>
            <div
              style={{
                marginLeft: 7,
                marginTop: 0,
                height: 500,
                marginBottom: 15,
              }}
              className={styles['card-overview']}
            >
              <div style={{ width: '100%', overflowY: 'scroll' }}>
                <div className={styles['dashboard_manager_bottom_row_col_parent_top']}>
                  <div>Thông tin cá nhân</div>
                  {/* <ModalUpdateUser user={user} reload={getInfoUser}>
                    <Button type="primary" onClick={getInfoUser} orderekt={orderekt}>
                      Chỉnh sửa
                    </Button>
                  </ModalUpdateUser> */}
                </div>
                {/* <ModalUpdateUser reload={getInfoUser} user={user}> */}
                <div className={styles['container-account']}>
                  <div className={styles['top-left-info']}>
                    <p style={{ fontWeight: 'bold' }}>- {user && (user.fullname || '...')}</p>
                    <p>- {user && (user.job || '...')}</p>
                    <p style={{ color: 'blue' }}>- {user && (user.email || '...')}</p>
                    <p style={{ color: 'blue' }}>- {user && (user.address || '...')}</p>
                    <p style={{ color: 'blue' }}>+ {user && (user.phone || '...')}</p>
                  </div>
                  <div className={styles['top-right-avt']}>
                    <Avatar
                      src={user.avatar}
                      style={{ color: '#FFF', backgroundColor: '#FDAA3E', width: 80, height: 80 }}
                    />
                  </div>
                </div>
                {/* </ModalUpdateUser> */}
                <div className={styles['dashboard_manager_bottom_row_col_parent_top']}>
                  <div style={{ marginLeft: '20px' }}>Status</div>
                </div>
                <div className={styles['container-dh']}>
                  <div className={styles['center']}>
                    <h1 style={{ fontWeight: 'bold' }}>180</h1>
                    <p>đơn hàng</p>
                  </div>
                  <div className={styles['center']}>
                    <h1 style={{ fontWeight: 'bold' }}>10</h1>
                    <p>cửa hàng thành viên</p>
                  </div>
                  <div className={styles['center']}>
                    <h1 style={{ fontWeight: 'bold' }}>6</h1>
                    <p>VIP</p>
                  </div>
                </div>
                <div className={styles['dashboard_manager_bottom_row_col_parent_top']}>
                  <div style={{ marginLeft: '20px' }}>About me</div>
                </div>
                <div style={{ marginLeft: '20px', textAlign: 'justify' }}>
                  Create React App doesn’t handle backend logic or databases; it just creates a
                  frontend build pipeline, so you can use it with any backend you want. Under the
                  hood, it uses Babel and webpack, but you don’t need to know anything about them.
                  When you’re ready to deploy to production, running npm run build will create an
                  optimized build of your app in the build folder. You can learn more about Create
                  React App from its README and the User Guide.
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default App
