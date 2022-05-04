import styles from './../exchange/exchange.module.scss'
import { Input, Row, Col, DatePicker, Popover, Table, Typography } from 'antd'
import {} from '@ant-design/icons'
import moment from 'moment'
import React from 'react'
import { compare } from 'utils'

const { Text } = Typography

const dateFormatList = ['YYYY/MM/DD', 'DD/MM/YY']

const columns = [
  {
    title: 'Mã đơn hàng',
    dataIndex: 'ordercode',
    width: 150,
    sorter: (a, b) => compare(a, b, 'ordercode'),
  },
  {
    title: 'Tên khách hàng',
    dataIndex: 'customername',
    width: 150,
    sorter: (a, b) => compare(a, b, 'customername'),
  },
  {
    title: 'Ngày trả',
    dataIndex: 'date',
    width: 150,
    sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 150,
    render: (data) => <span style={{ color: 'blue' }}>{data}</span>,
    sorter: (a, b) => compare(a, b, 'status'),
  },
  {
    title: 'Hoàn tiền',
    dataIndex: 'moneypay',
    width: 150,
    sorter: (a, b) => compare(a, b, 'moneypay'),
  },
  {
    title: 'Tổng tiền',
    dataIndex: 'moneytotal',
    width: 150,
    sorter: (a, b) => compare(a, b, 'moneytotal'),
  },
  {
    title: 'Lý do',
    dataIndex: 'reason',
    width: 150,
    sorter: (a, b) => compare(a, b, 'reason'),
  },
]

const data = []
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    ordercode: <div className={styles['order_code']}>{i}</div>,
    customername: `Nguyễn Văn A - ${i}`,
    date: `26/04/2021 - ${i}`,
    status: `Hoàn tiền - ${i}`,
    moneypay: `${i} VNĐ`,
    moneytotal: `${i} VNĐ`,
    reason: `Lỗi sản phẩm ${i}`,
  })
}
export default function Exchange() {
  const { Search } = Input

  function onChange(date, dateString) {
    console.log(date, dateString)
  }
  const onSearch = (value) => console.log(value)
  const content = (
    <div>
      <div>Gợi ý 1</div>
      <div>Gợi ý 2</div>
    </div>
  )
  return (
    <>
      <div className={styles['exchange_manager']}>
        <div className={styles['exchange_manager_title']}>Quản lý đổi trả</div>
        <Row className={styles['exchange_manager_select']}>
          <Col
            className={styles['exchange_manager_select_col']}
            xs={24}
            sm={24}
            md={7}
            lg={7}
            xl={7}
          >
            <Popover placement="bottomLeft" content={content} trigger="click">
              <div className={styles['exchange_manager_select_col_right']}>
                <Search
                  placeholder="Tìm kiếm"
                  onSearch={onSearch}
                  enterButton
                />
              </div>
            </Popover>
          </Col>
          <Col
            className={styles['exchange_manager_select_col']}
            xs={24}
            sm={24}
            md={7}
            lg={7}
            xl={7}
          >
            <div>
              <DatePicker
                onChange={onChange}
                className={styles['exchange_manager_select_col_calendar']}
                defaultValue={moment('2021/04/26', dateFormatList[0])}
              />
            </div>
          </Col>
        </Row>
        <div className={styles['exchange_manager_table']}>
          <Table
            columns={columns}
            dataSource={data}
            size="small"
            scroll={{ y: 500 }}
          />
        </div>
      </div>
    </>
  )
}
