import React, { useState } from 'react'
import styles from './../delivery/delivery.module.scss'
import moment from 'moment'

import { FileExcelOutlined, FileImageOutlined } from '@ant-design/icons'
import {
  Select,
  Row,
  Col,
  DatePicker,
  Tabs,
  Popover,
  Input,
  Cascader,
  Table,
  Button,
  Typography,
} from 'antd'
import { compare } from 'utils'
const { Option } = Select
const { Text } = Typography
const { TabPane } = Tabs

const columns = [
  {
    title: 'Mã giao hàng',
    dataIndex: 'shippingcode',
    width: 150,
    sorter: (a, b) => compare(a, b, 'shippingcode'),
  },
  {
    title: 'Đơn hàng',
    dataIndex: 'order',
    width: 150,
    sorter: (a, b) => compare(a, b, 'order'),
  },
  {
    title: 'Khách hàng',
    dataIndex: 'customer',
    width: 150,
    sorter: (a, b) => compare(a, b, 'customer'),
  },
  {
    title: 'Ngày đặt',
    dataIndex: 'date',
    width: 150,
    sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
  },
  {
    title: 'Nhà vận chuyển',
    dataIndex: 'home',
    width: 150,
    sorter: (a, b) => compare(a, b, 'home'),
  },
  {
    title: 'Giao hàng',
    dataIndex: 'shipping',
    width: 150,
    sorter: (a, b) => compare(a, b, 'shipping'),
  },
  {
    title: 'COD',
    dataIndex: 'cod',
    width: 150,
    sorter: (a, b) => compare(a, b, 'cod'),
  },
  {
    title: 'Tổng tiền',
    dataIndex: 'total',
    width: 150,
    sorter: (a, b) => compare(a, b, 'total'),
  },
]

const data = []
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    shippingcode: `${i}`,
    order: <div className={styles['order']}>#{i}</div>,
    customer: `N/A ${i}`,
    date: `2021/04/23 ${i}`,
    home: 'Khác',
    shipping: <div className={styles['shipping']}>Chờ lấy hàng</div>,
    cod: <div className={styles['shipping']}>Chưa thu tiền</div>,
    total: `${i} VNĐ`,
  })
}
const provinceDataDate = ['Zhejiang', 'Jiangsu']
const cityDataDate = {
  Zhejiang: ['Ngày tạo', '2021/01/01', '2021/02/01'],
  Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang'],
}
const provinceDataTag = ['Zhejiang', 'Jiangsu']
const cityDataTag = {
  Zhejiang: ['Đã được tag với', 'value 1', 'value 2'],
  Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang'],
}
const provinceDataAddress = ['Zhejiang', 'Jiangsu']
const cityDataAddress = {
  Zhejiang: ['Địa chỉ giao hàng', 'value 1', 'value 2'],
  Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang'],
}
const provinceDataProvince = ['Zhejiang', 'Jiangsu']
const cityDataProvince = {
  Zhejiang: ['Chọn tỉnh thành', 'value 1', 'value 2'],
  Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang'],
}
const provinceDataDistrict = ['Zhejiang', 'Jiangsu']
const cityDataDistrict = {
  Zhejiang: ['Chọn quận huyện', 'value 1', 'value 2'],
  Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang'],
}
const provinceDataProduct = ['Zhejiang', 'Jiangsu']
const cityDataProduct = {
  Zhejiang: ['Sản phẩm', 'value 1', 'value 2'],
  Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang'],
}
export default function Delivery() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const { Search } = Input

  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const dateFormat = 'YYYY/MM/DD'

  const content = (
    <div className={styles['date_delivery']}>
      <div>Hiển thị phiếu giao hàng theo</div>
      <div>
        <DatePicker
          defaultValue={moment('2015/01/01', dateFormat)}
          format={dateFormat}
        />
      </div>
      <div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
  const [citiesDate, setCitiesDate] = React.useState(
    cityDataDate[provinceDataDate[0]]
  )
  const [secondCityDate, setSecondCityDate] = React.useState(
    cityDataDate[provinceDataDate[0]][0]
  )

  const onSecondCityChangeDate = (value) => {
    setSecondCityDate(value)
  }
  const [citiesTag, setCitiesTag] = React.useState(
    cityDataTag[provinceDataTag[0]]
  )
  const [secondCityTag, setSecondCityTag] = React.useState(
    cityDataTag[provinceDataTag[0]][0]
  )

  const onSecondCityChangeTag = (value) => {
    setSecondCityTag(value)
  }
  const [citiesAddress, setCitieyAddress] = React.useState(
    cityDataAddress[provinceDataAddress[0]]
  )
  const [secondCityAddress, setSecondCityAddress] = React.useState(
    cityDataAddress[provinceDataAddress[0]][0]
  )

  const onSecondCityChangeAddress = (value) => {
    setSecondCityAddress(value)
  }
  const [citiesProvince, setCitieyProvince] = React.useState(
    cityDataProvince[provinceDataProvince[0]]
  )
  const [secondCityProvince, setSecondCityProvince] = React.useState(
    cityDataProvince[provinceDataProvince[0]][0]
  )

  const onSecondCityChangeProvince = (value) => {
    setSecondCityProvince(value)
  }
  const [citiesDistrict, setCitieyDistrict] = React.useState(
    cityDataDistrict[provinceDataDistrict[0]]
  )
  const [secondCityDistrict, setSecondCityDistrict] = React.useState(
    cityDataDistrict[provinceDataDistrict[0]][0]
  )

  const onSecondCityChangeDistrict = (value) => {
    setSecondCityDistrict(value)
  }
  const [citiesProduct, setCitieyProduct] = React.useState(
    cityDataProduct[provinceDataProduct[0]]
  )
  const [secondCityProduct, setSecondCityProduct] = React.useState(
    cityDataProduct[provinceDataProduct[0]][0]
  )

  const onSecondCityChangeProduct = (value) => {
    setSecondCityProduct(value)
  }
  const optionsCascader = [
    {
      value: 'trangthai',
      label: 'Trạng thái',
      children: [
        {
          value: 'mo',
          label: 'Mở',
        },
        {
          value: 'luutru',
          label: 'Lưu trữ',
        },
        {
          value: 'huy',
          label: 'Hủy',
        },
      ],
    },
    {
      value: 'trangthaithuho',
      label: 'Trạng thái thu hộ',
      children: [
        {
          value: 'chuathutien',
          label: 'Chưa thu tiền',
        },
        {
          value: 'dathutien',
          label: 'Đã thu tiền',
        },
        {
          value: 'danhantien',
          label: 'Đã nhận tiền',
        },
        {
          value: 'cothuho',
          label: 'Có thu hộ',
        },
        {
          value: 'khongthuho',
          label: 'Không thu hộ',
        },
      ],
    },
    {
      value: 'trangthaigiaohang',
      label: 'Trạng thái giao hàng',
      children: [
        {
          value: 'cholayhang',
          label: 'Chờ lấy hàng',
        },
        {
          value: 'danggiaohang',
          label: 'Đang giao hàng',
        },
        {
          value: 'dagiaohang',
          label: 'Đã giao hàng',
        },
        {
          value: 'chochuyenkhoang',
          label: 'Chờ chuyển khoảng',
        },
        {
          value: 'huygiaohang',
          label: 'Hủy giao hàng',
        },
        {
          value: 'giaohangloi',
          label: 'Giao hàng lỗi',
        },
      ],
    },
    {
      value: 'ngaytao',
      label: 'Ngày tạo',
      children: [
        {
          value: 'date',
          label: (
            <div className={styles['date_delivery']}>
              <div className={styles['date_delivery_title']}>
                Hiển thị phiếu giao hàng theo
              </div>
              <div className={styles['date_delivery_parent']}>
                <Select
                  className={styles['date_delivery_parent_date']}
                  value={secondCityDate}
                  onChange={onSecondCityChangeDate}
                >
                  {citiesDate.map((city) => (
                    <Option key={city}>{city}</Option>
                  ))}
                </Select>
              </div>
              <div className={styles['date_delivery_parent']}>
                <div className={styles['date_delivery_child']}>
                  <div>Từ ngày</div>
                  <div>
                    <DatePicker
                      defaultValue={moment('2015/01/01', dateFormat)}
                      format={dateFormat}
                    />
                  </div>
                </div>
                <div className={styles['date_delivery_child']}>
                  <div>Đến ngày</div>
                  <div>
                    <DatePicker
                      defaultValue={moment('2015/01/05', dateFormat)}
                      format={dateFormat}
                    />
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      value: 'tag',
      label: 'Đã được tag với',
      children: [
        {
          value: 'delivery',
          label: (
            <div className={styles['date_delivery']}>
              <div className={styles['date_delivery_title']}>
                Hiển thị phiếu giao hàng theo
              </div>
              <div className={styles['date_delivery_parent']}>
                <Select
                  className={styles['date_delivery_parent_date']}
                  value={secondCityTag}
                  onChange={onSecondCityChangeTag}
                >
                  {citiesTag.map((city) => (
                    <Option key={city}>{city}</Option>
                  ))}
                </Select>
              </div>
              <div className={styles['date_delivery_parent']}>
                <Input
                  className={styles['date_delivery_parent_date']}
                  placeholder="Nhập tag"
                />
              </div>
            </div>
          ),
        },
      ],
    },
    {
      value: 'deliveryaddress',
      label: 'Địa chỉ giao hàng',
      children: [
        {
          value: 'delivery',
          label: (
            <div className={styles['date_delivery']}>
              <div className={styles['date_delivery_title']}>
                Hiển thị phiếu giao hàng theo
              </div>
              <div className={styles['date_delivery_parent']}>
                <Select
                  className={styles['date_delivery_parent_date']}
                  value={secondCityAddress}
                  onChange={onSecondCityChangeAddress}
                >
                  {citiesAddress.map((city) => (
                    <Option key={city}>{city}</Option>
                  ))}
                </Select>
              </div>
              <div className={styles['date_delivery_parent']}>
                <div className={styles['date_delivery_child']}>
                  <div className={styles['date_delivery_child_top_parent']}>
                    <Select
                      className={styles['date_delivery_parent_date']}
                      value={secondCityProvince}
                      style={{ width: 170 }}
                      onChange={onSecondCityChangeProvince}
                    >
                      {citiesProvince.map((city) => (
                        <Option key={city}>{city}</Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className={styles['date_delivery_child']}>
                  <div>
                    <Select
                      style={{ width: 170 }}
                      className={styles['date_delivery_parent_date']}
                      value={secondCityDistrict}
                      onChange={onSecondCityChangeDistrict}
                    >
                      {citiesDistrict.map((city) => (
                        <Option key={city}>{city}</Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      value: 'nhavanchuyen',
      label: 'Nhà vận chuyển',
      children: [
        {
          value: 'giaohangtietkiem',
          label: 'Giao hàng tiết kiệm',
        },
        {
          value: 'giaohangnhanh',
          label: 'Giao hàng nhanh',
        },
        {
          value: 'boxme',
          label: 'Boxme',
        },
        {
          value: 'vnpost',
          label: 'VNPost',
        },
        {
          value: 'dhl',
          label: 'DHL',
        },
        {
          value: 'viettelpost',
          label: 'Viettel Post',
        },
        {
          value: 'khac',
          label: 'Khác',
        },
      ],
    },
    {
      value: 'sanpham',
      label: 'Sản phẩm',
      children: [
        {
          value: 'delivery',
          label: (
            <div className={styles['date_delivery']}>
              <div className={styles['date_delivery_title']}>
                Hiển thị phiếu giao hàng theo
              </div>
              <div className={styles['date_delivery_parent']}>
                <Select
                  className={styles['date_delivery_parent_date']}
                  value={secondCityProduct}
                  onChange={onSecondCityChangeProduct}
                >
                  {citiesProduct.map((city) => (
                    <Option key={city}>{city}</Option>
                  ))}
                </Select>
              </div>
              <div className={styles['date_delivery_parent']}>
                <Input
                  className={styles['date_delivery_parent_date']}
                  placeholder="Nhập tag"
                />
                <div className={styles['date_delivery_parent_product']}>
                  <div>
                    <FileImageOutlined />
                  </div>
                  <div>Gấu bông Teddy</div>
                </div>
                <div className={styles['date_delivery_parent_product']}>
                  <div>
                    <FileImageOutlined />
                  </div>
                  <div>Nước hoa</div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
  ]

  function handleChange(value) {
    console.log(`selected ${value}`)
  }
  return (
    <>
      <div className={styles['import_manager']}>
        <Row className={styles['import_manager_title']}>
          <Col
            className={styles['import_manager_title_col']}
            xs={22}
            sm={11}
            md={11}
            lg={11}
            xl={11}
          >
            <div className={styles['import_manager_title_col_title_parent']}>
              <div>Quản lý giao hàng</div>
            </div>
          </Col>
          <Col
            className={styles['import_manager_title_col']}
            xs={22}
            sm={11}
            md={11}
            lg={11}
            xl={11}
          >
            <div className={styles['import_manager_title_col_right']}>
              <Button
                className={styles['import_manager_excel_button']}
                type="primary"
                style={{
                  width: 150,
                  backgroundColor: '#32CB00',
                  border: 'none',
                }}
                icon={<FileExcelOutlined />}
                // loading={loadings[1]}
                // onClick={() => this.enterLoading(1)}
              >
                Xuất excel
              </Button>
            </div>
          </Col>
        </Row>
        <div className={styles['card-container']}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Tất cả phiếu giao hàng" key="1">
              <div className={styles['import_manager_tabs']}>
                <Row className={styles['import_manager_tabs_row']}>
                  <Col
                    className={styles['import_manager_tabs_col_tastader']}
                    xs={22}
                    sm={7}
                    md={7}
                    lg={7}
                    xl={7}
                  >
                    <div>
                      <Cascader
                        // autoFocus="true"
                        // expandTrigger="hover"
                        className={styles['import_manager_tabs_col_child']}
                        options={optionsCascader}
                        placeholder="Chọn điều kiện lọc phiếu giao hàng"
                      />
                    </div>
                  </Col>
                  <Col
                    className={styles['import_manager_tabs_col']}
                    xs={22}
                    sm={15}
                    md={15}
                    lg={15}
                    xl={15}
                  >
                    <Popover
                      placement="bottomLeft"
                      content={content}
                      trigger="click"
                    >
                      <div>
                        <Search
                          placeholder="Tìm kiếm phiếu giao hàng"
                          enterButton
                        />
                      </div>
                    </Popover>
                  </Col>
                </Row>
                <div className={styles['import_manager_table']}>
                  <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={data}
                    size="small"
                    scroll={{ y: 500 }}
                  />
                </div>
              </div>
            </TabPane>

            <TabPane tab="Chờ lấy hàng" key="2">
              <div className={styles['import_manager_tabs']}>
                <Row className={styles['import_manager_tabs_row']}>
                  <Col
                    className={styles['import_manager_tabs_col_tastader']}
                    xs={22}
                    sm={7}
                    md={7}
                    lg={7}
                    xl={7}
                  >
                    <div>
                      <Cascader
                        className={styles['import_manager_tabs_col_child']}
                        options={optionsCascader}
                        placeholder="Chọn điều kiện lọc phiếu giao hàng"
                      />
                    </div>
                  </Col>
                  <Col
                    className={styles['import_manager_tabs_col']}
                    xs={22}
                    sm={15}
                    md={15}
                    lg={15}
                    xl={15}
                  >
                    <Popover
                      placement="bottomLeft"
                      content={content}
                      trigger="click"
                    >
                      <div>
                        <Search
                          placeholder="Tìm kiếm phiếu giao hàng"
                          enterButton
                        />
                      </div>
                    </Popover>
                  </Col>
                </Row>
                <div className={styles['import_manager_table']}>
                  <Table
                    size="small"
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={data}
                    scroll={{ y: 500 }}
                  />
                </div>
              </div>
            </TabPane>
            <TabPane tab="Đang giao hàng" key="3">
              <div className={styles['import_manager_tabs']}>
                <Row className={styles['import_manager_tabs_row']}>
                  <Col
                    className={styles['import_manager_tabs_col_tastader']}
                    xs={22}
                    sm={7}
                    md={7}
                    lg={7}
                    xl={7}
                  >
                    <div>
                      <Cascader
                        className={styles['import_manager_tabs_col_child']}
                        options={optionsCascader}
                        placeholder="Chọn điều kiện lọc phiếu giao hàng"
                      />
                    </div>
                  </Col>
                  <Col
                    className={styles['import_manager_tabs_col']}
                    xs={22}
                    sm={15}
                    md={15}
                    lg={15}
                    xl={15}
                  >
                    <Popover
                      placement="bottomLeft"
                      content={content}
                      trigger="click"
                    >
                      <div>
                        <Search
                          placeholder="Tìm kiếm phiếu giao hàng"
                          enterButton
                        />
                      </div>
                    </Popover>
                  </Col>
                </Row>
                <div className={styles['import_manager_table']}>
                  <Table
                    size="small"
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={data}
                    scroll={{ y: 500 }}
                  />
                </div>
              </div>
            </TabPane>
            <TabPane tab="Đã giao hàng" key="4">
              <div className={styles['import_manager_tabs']}>
                <Row className={styles['import_manager_tabs_row']}>
                  <Col
                    className={styles['import_manager_tabs_col_tastader']}
                    xs={22}
                    sm={7}
                    md={7}
                    lg={7}
                    xl={7}
                  >
                    <div>
                      <Cascader
                        className={styles['import_manager_tabs_col_child']}
                        options={optionsCascader}
                        placeholder="Chọn điều kiện lọc phiếu giao hàng"
                      />
                    </div>
                  </Col>
                  <Col
                    className={styles['import_manager_tabs_col']}
                    xs={22}
                    sm={15}
                    md={15}
                    lg={15}
                    xl={15}
                  >
                    <Popover
                      placement="bottomLeft"
                      content={content}
                      trigger="click"
                    >
                      <div>
                        <Search
                          placeholder="Tìm kiếm phiếu giao hàng"
                          enterButton
                        />
                      </div>
                    </Popover>
                  </Col>
                </Row>
                <div className={styles['import_manager_table']}>
                  <Table
                    size="small"
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={data}
                    scroll={{ y: 500 }}
                  />
                </div>
              </div>
            </TabPane>
            <TabPane tab="Chờ chuyển hàng" key="5">
              <div className={styles['import_manager_tabs']}>
                <Row className={styles['import_manager_tabs_row']}>
                  <Col
                    className={styles['import_manager_tabs_col_tastader']}
                    xs={22}
                    sm={7}
                    md={7}
                    lg={7}
                    xl={7}
                  >
                    <div>
                      <Cascader
                        className={styles['import_manager_tabs_col_child']}
                        options={optionsCascader}
                        placeholder="Chọn điều kiện lọc phiếu giao hàng"
                      />
                    </div>
                  </Col>
                  <Col
                    className={styles['import_manager_tabs_col']}
                    xs={22}
                    sm={15}
                    md={15}
                    lg={15}
                    xl={15}
                  >
                    <Popover
                      placement="bottomLeft"
                      content={content}
                      trigger="click"
                    >
                      <div>
                        <Search
                          placeholder="Tìm kiếm phiếu giao hàng"
                          enterButton
                        />
                      </div>
                    </Popover>
                  </Col>
                </Row>
                <div className={styles['import_manager_table']}>
                  <Table
                    size="small"
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={data}
                    scroll={{ y: 500 }}
                  />
                </div>
              </div>
            </TabPane>
            <TabPane tab="Đã chuyển hàng" key="6">
              <div className={styles['import_manager_tabs']}>
                <Row className={styles['import_manager_tabs_row']}>
                  <Col
                    className={styles['import_manager_tabs_col_tastader']}
                    xs={22}
                    sm={7}
                    md={7}
                    lg={7}
                    xl={7}
                  >
                    <div>
                      <Cascader
                        className={styles['import_manager_tabs_col_child']}
                        options={optionsCascader}
                        placeholder="Chọn điều kiện lọc phiếu giao hàng"
                      />
                    </div>
                  </Col>
                  <Col
                    className={styles['import_manager_tabs_col']}
                    xs={22}
                    sm={15}
                    md={15}
                    lg={15}
                    xl={15}
                  >
                    <Popover
                      placement="bottomLeft"
                      content={content}
                      trigger="click"
                    >
                      <div>
                        <Search
                          placeholder="Tìm kiếm phiếu giao hàng"
                          enterButton
                        />
                      </div>
                    </Popover>
                  </Col>
                </Row>
                <div className={styles['import_manager_table']}>
                  <Table
                    size="small"
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={data}
                    scroll={{ y: 500 }}
                  />
                </div>
              </div>
            </TabPane>

            <TabPane tab="Hủy giao hàng" key="7">
              <div className={styles['import_manager_tabs']}>
                <Row className={styles['import_manager_tabs_row']}>
                  <Col
                    className={styles['import_manager_tabs_col_tastader']}
                    xs={22}
                    sm={7}
                    md={7}
                    lg={7}
                    xl={7}
                  >
                    <div>
                      <Cascader
                        className={styles['import_manager_tabs_col_child']}
                        options={optionsCascader}
                        placeholder="Chọn điều kiện lọc phiếu giao hàng"
                      />
                    </div>
                  </Col>
                  <Col
                    className={styles['import_manager_tabs_col']}
                    xs={22}
                    sm={15}
                    md={15}
                    lg={15}
                    xl={15}
                  >
                    <Popover
                      placement="bottomLeft"
                      content={content}
                      trigger="click"
                    >
                      <div>
                        <Search
                          placeholder="Tìm kiếm phiếu giao hàng"
                          enterButton
                        />
                      </div>
                    </Popover>
                  </Col>
                </Row>
                <div className={styles['import_manager_table']}>
                  <Table
                    size="small"
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={data}
                    scroll={{ y: 500 }}
                  />
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </>
  )
}
