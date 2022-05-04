import { Link } from 'react-router-dom'
import {
  Input,
  Button,
  Popover,
  Row,
  Col,
  Table,
  Select,
  DatePicker,
  Typography,
} from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { PlusCircleOutlined } from '@ant-design/icons'
import styles from './../reven-expen/reven-expen.module.scss'
const { Option } = Select
const { Text } = Typography
const columns = [
  {
    title: 'Ngày',
    dataIndex: 'date',
    width: 150,
    sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
  },
  {
    title: 'Diễn giải',
    dataIndex: 'explain',
    width: 150,
  },
  {
    title: 'Số tiền',
    dataIndex: 'money',
    width: 150,
  },
  {
    title: 'Thu',
    dataIndex: 'reven',
    width: 150,
  },
  {
    title: 'Chi',
    dataIndex: 'expen',
    width: 150,
  },
  {
    title: '',
    dataIndex: 'detail',
    width: 150,
  },
]

const data = []
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    date: `2021-04-30`,
    explain: `Trả tiền văn phòng ${i}`,
    money: `${i} VNĐ`,
    reven: `Doanh thu bán hàng ${i}`,
    expen: `Doanh thu mua hàng ${i}`,
    detail: (
      <Link to="/actions/reven-expen/add/information">
        <div className={styles['detail']}>Chi tiết</div>
      </Link>
    ),
  })
}
export default function RevenExpend() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const { Search } = Input
  const onSearch = (value) => console.log(value)
  const dateFormat = 'YYYY/MM/DD'

  const onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys)
    setSelectedRowKeys(selectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }
  const contentReven = (
    <div className={styles['reven']}>
      <div className={styles['reven_item']}>Doanh thu bán hàng</div>
      <div className={styles['reven_item']}>Doanh thu khác</div>
    </div>
  )
  const contentExpen = (
    <div className={styles['reven']}>
      <div className={styles['reven_item']}>Giá vốn</div>
      <div className={styles['reven_item']}>Chi phí quản lý doanh nghiệp</div>
      <div className={styles['reven_item']}>Chi phí sản xuất</div>
    </div>
  )
  function handleChangeFilter(value) {
    console.log(`selected ${value}`)
  }
  function onChange(date, dateString) {
    console.log(date, dateString)
  }
  const content = (
    <div>
      <div>Gợi ý 1</div>
      <div>Gợi ý 2</div>
    </div>
  )
  return (
    <>
      <div className={styles['reven_manager']}>
        <div className={styles['reven_manager_title']}>
          <div>Quản lý thu chi</div>
        </div>
        <div className={styles['reven_manager_search']}>
          <Row className={styles['reven_manager_search_row']}>
            <Col
              xs={22}
              sm={11}
              md={11}
              lg={11}
              xl={11}
              className={styles['reven_manager_search_row_col']}
            >
              <Popover placement="bottomLeft" content={content} trigger="click">
                <div className={styles['reven_manager_search_row_col_search']}>
                  <Search
                    placeholder="Tìm kiếm sản phẩm"
                    onSearch={onSearch}
                    enterButton
                  />
                </div>
              </Popover>
            </Col>
            <Col
              xs={22}
              sm={11}
              md={11}
              lg={11}
              xl={11}
              className={styles['reven_manager_search_row_col']}
            >
              <div className={styles['reven_manager_search_row_col_button']}>
                <Link to="/actions/reven-expen/add/show">
                  <Button type="primary" icon={<PlusCircleOutlined />}>
                    Thêm phiếu thu chi
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </div>
        <div className={styles['reven_manager_select']}>
          <Row className={styles['reven_manager_select_row']}>
            <Col
              xs={20}
              sm={20}
              md={4}
              lg={4}
              xl={4}
              className={styles['reven_manager_search_row_col']}
            >
              <div>
                <Select
                  defaultValue="filter0"
                  className={styles['reven_manager_search_row_col_select']}
                  onChange={handleChangeFilter}
                >
                  <Option value="filter0">Lọc</Option>
                  <Option value="filter1">Theo doanh thu</Option>
                  <Option value="filter2">Theo chi phí</Option>
                </Select>
              </div>
            </Col>
            <Col
              xs={20}
              sm={20}
              md={4}
              lg={4}
              xl={4}
              className={styles['reven_manager_search_row_col']}
            >
              <div>
                <DatePicker
                  className={styles['reven_manager_search_row_col_select']}
                  defaultValue={moment('2021/01/01', dateFormat)}
                  onChange={onChange}
                />
              </div>
            </Col>
            <Col
              xs={20}
              sm={20}
              md={4}
              lg={4}
              xl={4}
              className={styles['reven_manager_search_row_col']}
            >
              <div>
                <Popover trigger="hover" content={contentReven}>
                  <div
                    className={styles['reven_manager_search_row_col_revenue']}
                  >
                    <div>Tổng doanh thu</div>
                    <div>10.000.000 VNĐ</div>
                  </div>
                </Popover>
              </div>
            </Col>
            <Col
              xs={20}
              sm={20}
              md={4}
              lg={4}
              xl={4}
              className={styles['reven_manager_search_row_col']}
            >
              <div>
                <Popover trigger="hover" content={contentExpen}>
                  <div className={styles['reven_manager_search_row_col_cost']}>
                    <div>Tổng chi phí</div>
                    <div>15.000.000 VNĐ</div>
                  </div>
                </Popover>
              </div>
            </Col>
          </Row>
        </div>
        <div className={styles['reven_manager_table']}>
          <Table
            size="small"
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
            scroll={{ y: 500 }}
          />
        </div>
        <div className={styles['reven_manager_button']}>
          <Button type="primary" danger>
            Xóa
          </Button>
        </div>
      </div>
    </>
  )
}
