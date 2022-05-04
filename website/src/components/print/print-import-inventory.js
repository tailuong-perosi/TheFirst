import React from 'react'

//antd
import { Row, Divider, Space, Table } from 'antd'
import moment from 'moment'
import { formatCash } from 'utils'

export default class PrintOrder extends React.PureComponent {
  render() {
    const data = this.props.data || {}

    const columns = [
      {
        title: 'STT',
        width: 80,
        render: (text, record, index) => index + 1,
      },
      {
        title: 'Tên sản phẩm',
        render: (text, record) => record.variant_info && record.variant_info.title,
      },
      {
        title: 'Đơn vị',
        render: (text, record) => record.product_info && record.product_info.unit,
      },
      {
        title: 'Số lượng',
        render: (text, record) => record.quantity && formatCash(record.quantity),
      },
      {
        title: 'Đơn giá',
        render: (text, record) => record.import_price && formatCash(record.import_price),
      },
      {
        title: 'Thuế',
      },
      {
        title: 'Thành tiền',
        render: (text, record) =>
          record.quantity && record.import_price
            ? formatCash(+record.quantity * +record.import_price)
            : 0,
      },
    ]

    return (
      <div style={{ paddingTop: 55, paddingLeft: 35, paddingRight: 35 }}>
        <Row justify="end">
          <Space direction="vertical">
            <Row wrap={false} justify="space-between">
              <div>Mã đơn nhập:</div> <b>{data.code || ''}</b>
            </Row>
            <Row wrap={false} justify="space-between">
              <div>Ngày tạo:</div>
              <b>{data.create_date && moment(data.create_date).format('DD-MM-YYYY')}</b>
            </Row>
            <Row wrap={false} justify="space-between">
              Tham chiếu:
            </Row>
            <Row wrap={false} justify="space-between">
              <div>Ngày nhận hàng: </div>
              <b>{data.verify_date && moment(data.verify_date).format('DD-MM-YYYY')}</b>
            </Row>
          </Space>
        </Row>
        <div style={{ borderBottom: '0.5px solid gray', margin: '20px 0px' }} />
        <div>
          <Row justify="center">
            <h3 style={{ fontWeight: 700, fontSize: 25 }}>Đơn nhập hàng</h3>
          </Row>
          <Row justify="space-between" wrap={false}>
            <div style={{ width: '50%' }}>
              <div style={{ fontWeight: 600 }}>Nhà cung cấp</div>
            </div>
            <div style={{ width: '50%' }}>
              <div style={{ fontWeight: 600 }}>Hóa đơn đến</div>
              <div>{data.import_location_info && data.import_location_info.name}</div>
            </div>
            <div style={{ width: '50%' }}>
              <div style={{ fontWeight: 600 }}>Giao hàng đến</div>
              <div>{data.import_location_info && data.import_location_info.name}</div>
            </div>
          </Row>
        </div>
        <Table
          pagination={false}
          size="small"
          bordered
          columns={columns}
          style={{ width: '100%', margin: '27px 0px' }}
          dataSource={data.products || []}
        />

        <Row justify="end">
          <Space direction="vertical" style={{ width: '50%' }}>
            <Row justify="space-between" style={{ borderBottom: '0.5px solid gray' }}>
              <div>Tổng số lượng</div>
              <div>{formatCash(data.total_quantity || 0)}</div>
            </Row>
            <Row justify="space-between" style={{ borderBottom: '0.5px solid gray' }}>
              <div>Tổng tiền hàng</div>
              <div>{formatCash(data.total_cost || 0)}</div>
            </Row>
            <Row justify="space-between" style={{ borderBottom: '1.2px solid gray' }}>
              <div>Tổng thuế</div>
              <div>{formatCash(data.total_tax || 0)}</div>
            </Row>
            <Row justify="space-between" style={{ fontWeight: 600 }}>
              <div>Tổng tiền (VNĐ)</div>
              <div>{formatCash(data.final_cost || 0)}</div>
            </Row>
          </Space>
        </Row>
      </div>
    )
  }
}
