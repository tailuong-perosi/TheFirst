import React, { useState, useEffect } from 'react'

//antd
import { Modal, Form, Row, Col, Input, Button, Upload, notification, Table } from 'antd'

//icons
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { compare, formatCash, compareCustom } from 'utils'
import moment from 'moment'
import columnsOrder from './columns'
import SettingColumns from 'components/setting-columns'



import {
    ROUTES,
    PAGE_SIZE,
    PAGE_SIZE_OPTIONS,
  } from 'consts'
//apis

export default function ModalShopping({ detailshopping, children, reload, record }) {
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)
  const [columns, setColumns] = useState([])
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: PAGE_SIZE })
  const [countOrder, setCountOrder] = useState(0)




  const columnsProduct = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'sku',
      sorter: (a, b) => compare(a, b, 'sku'),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      render: (data) => (
        <img src={data && data[0] ? data[0] : ''} style={{ maxWidth: 60, maxHeight: 60 }} alt="" />
      ),
    },
    {
      title: 'Tên sản phẩm',

      
      dataIndex: 'title',
      sorter: (a, b) => compare(a, b, 'title'),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      sorter: (a, b) => compare(a, b, 'quantity'),
    },
    {
      title: 'Đơn giá',
      sorter: (a, b) => compare(a, b, 'price'),

      render: (text, record) => (record.price ? formatCash(+record.price) : 0),
    },
    {
      title: 'Chiết khấu',
      sorter: (a, b) => compare(a, b, 'discount'),

      render: (text, record) => (record.discount ? formatCash(+record.discount) : 0),
    },
    {
      title: 'Thành tiền',
      sorter: (a, b) => compare(a, b, 'total_cost'),
      render: (text, record) => (record.total_cost ? formatCash(+record.total_cost) : 0),
    },
  ]
  return (
    <>
        <SettingColumns
          
          columnsDefault={columnsOrder}
          nameColumn="columnsOrder"
          columns={columns}
          setColumns={setColumns}
        />
      <div onClick={toggle}>{children}</div>
      <Modal
        width="60%"
        title="Chi tiết đơn hàng"
        centered
        footer={null}
        visible={visible}
        okText="Lưu"
        cancelText="Đóng"
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      >
          {/* <p>{detailShopping.code}</p> */}


 <Table
        size="small"
        rowKey="orderId"
        loading={loading}
        scroll={{ y: 400 }}
        expandable={{
          expandedRowRender: (record) => {
            return (
              <div style={{ paddingTop: 17, paddingBottom: 17 }}>
                <Row wrap={false}>
                  <div
                    style={{
                      width: 'calc(100% - 165px)',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 5,
                      border: '1px solid #E8EAEB',
                      padding: '15px 0px',
                      marginRight: 15,
                      fontSize: 14.7,
                    }}
                  >
                    <Row wrap={false}>
                      <div style={{ width: '100%', padding: '0px 25px' }}>
                        <p style={{ fontWeight: 700, marginBottom: 6 }}>Thông tin đơn hàng</p>
                        <Row justify="space-between">
                          <div style={{ color: '#747C87' }}>Mã đơn hàng:</div>
                          <div>{record.order_id || ''}</div>
                        </Row>
                        <Row justify="space-between">
                          <div style={{ color: '#747C87' }}>Ngày tạo:</div>
                          <div>{moment(record.create_date).format('DD/MM/YYYY HH:mm')}</div>
                        </Row>
                        <Row justify="space-between">
                          <div style={{ color: '#747C87' }}>Nguồn bán hàng:</div>
                          <div>POS</div>
                        </Row>
                        <Row justify="space-between">
                          <div style={{ color: '#747C87' }}>Nhân viên bán hàng:</div>
                          <div>
                            {record.employee
                              ? `${record.employee.first_name} ${record.employee.last_name}`
                              : ''}
                          </div>
                        </Row>
                      </div>
                      <div
                        style={{
                          width: '33.33333%',
                          padding: '0px 25px',
                          borderRight: '1px solid #E8EAEB',
                        }}
                      >
                        <p style={{ fontWeight: 700, marginBottom: 6 }}>Khách hàng</p>
                        <Row wrap={false} style={{ width: '100%' }}>
                          <a>
                            {record.customer
                              ? `${record.customer.first_name} ${record.customer.last_name}`
                              : ''}
                          </a>
                          <div style={{ margin: '0px 5px', display: !record.customer && 'none' }}>
                            -
                          </div>
                          <div>{record.customer ? record.customer.phone : ''}</div>
                        </Row>
                        <div>
                          {record.customer
                            ? `${record.customer.address}, ${record.customer.district}, ${record.customer.province}`
                            : ''}
                        </div>
                      </div>
                    
                    </Row>
                  </div>
                  
                </Row>
                <div className="table-product-in-order">
                  <Table
                    pagination={false}
                    size="small"
                    style={{ width: '99%', marginTop: 30 }}
                    columns={columnsProduct}
                    dataSource={record.order_details}
                    summary={() => (
                      <Table.Summary.Row>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                        <Table.Summary.Cell colSpan={2}>
                          <div style={{ fontSize: 14.7 }}>
                            <Row wrap={false} justify="space-between">
                              <div>Tổng tiền ({record.order_details.length} sản phẩm)</div>
                              <div>{record.total_cost ? formatCash(+record.total_cost) : 0}</div>
                            </Row>
                            <Row wrap={false} justify="space-between">
                              <div>Tổng thuế</div>
                              <div>{record.total_tax ? formatCash(+record.total_tax) : 0}</div>
                            </Row>
                            <Row wrap={false} justify="space-between">
                              <div>Chiết khấu</div>
                              <div>
                                {record.promotion
                                  ? `${formatCash(+(record.promotion.value || 0))} ${
                                      record.promotion.type && record.promotion.type !== 'VALUE'
                                        ? '%'
                                        : ''
                                    }`
                                  : 0}
                              </div>
                            </Row>
                            <Row wrap={false} justify="space-between">
                              <div>Phí giao hàng</div>
                              <div>
                                {record.shipping_info
                                  ? formatCash(+record.shipping_info.cod || 0)
                                  : 0}
                              </div>
                            </Row>
                            <Row wrap={false} justify="space-between" style={{ fontWeight: 600 }}>
                              <div>Tổng thanh toán</div>
                              <div>
                                {record.final_cost ? formatCash(+record.final_cost || 0) : 0}
                              </div>
                            </Row>
                          </div>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                  />
                </div>
              </div>
            )
          },
        }}
        columns={columns.map((column) => {
          if (column.key === 'stt')
            return {
              ...column,
              width: 50,
              render: (text, record, index) =>
                (paramsFilter.page - 1) * paramsFilter.page_size + index + 1,
            }
  
          if (column.key === 'create_date')
            return {
              ...column,
              render: (text, record) => text && moment(text).format('DD/MM/YYYY HH:mm'),
              sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
            }
          if (column.key === 'channel')
            return {
              ...column,
              render: (text, record, index) => <span>{text}</span>,
              //   (paramsFilter.page - 1) * paramsFilter.page_size + index + 1,
            }
          if (column.key === 'customer')
            return {
              ...column,
              sorter: (a, b) =>
                compareCustom(
                  a.customer ? `${a.customer.first_name} ${a.customer.last_name}` : '',
                  b.customer ? `${b.customer.first_name} ${b.customer.last_name}` : ''
                ),
              render: (text, record) =>
                record.customer ? `${record.customer.first_name} ${record.customer.last_name}` : '',
            }
          if (column.key === 'employee')
            return {
              ...column,
              sorter: (a, b) =>
                compareCustom(
                  a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : '',
                  a.employee ? `${b.employee.first_name} ${b.employee.last_name}` : ''
                ),
              render: (text, record) =>
                record.employee ? `${record.employee.first_name} ${record.employee.last_name}` : '',
            }
          if (column.key === 'payments_method')
            return {
              ...column,
              render: (text, record) =>
                record.payments && record.payments.map((payment) => payment.method).join(', '),
            }
          if (column.key === 'final_cost')
            return {
              ...column,
              sorter: (a, b) => compare(a, b, 'final_cost'),
              render: (text) => formatCash(text),
            }


          return column
        })}
        style={{ width: '100%', marginTop: 25 }}
        pagination={{
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showQuickJumper: true,
          onChange: (page, pageSize) =>
            setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
          total: countOrder,
        }}
        dataSource={detailshopping}
      />
      </Modal>
    </>
  )
}
