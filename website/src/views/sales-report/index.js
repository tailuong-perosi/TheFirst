import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { compare, formatCash } from 'utils'
import { useHistory } from 'react-router-dom'
import { ROUTES } from 'consts'

//antd
import { Row, Col, Button, Table, DatePicker } from 'antd'

//icons
import { ArrowLeftOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'

//components
import TitlePage from 'components/title-page'
import columnsSalesReport from './columns'
import exportToCSV from 'components/ExportCSV/export'

//apis
import { getReportOrder } from 'apis/report'

export default function ReportFinancial() {
  const history = useHistory()
  const dateFormat = 'YYYY-MM-DD'

  const [paramsFilter, setParamsFilter] = useState({
    page: 1,
    page_size: 20,
    from_date: moment(new Date()).format('YYYY-MM-DD'),
    to_date: moment(new Date()).format('YYYY-MM-DD'),
  })
  const [loading, setLoading] = useState(false)
  const [countReport, setCountReport] = useState(0)
  const [salesReport, setSalesReport] = useState([])
  const [dateFilter, setDateFilter] = useState([moment(new Date()), moment(new Date())])

  const onChangeDate = (date, dateString) => {
    setDateFilter(date)
    if (date) {
      paramsFilter.from_date = dateString[0]
      paramsFilter.to_date = dateString[1]
    } else {
      delete paramsFilter.from_date
      delete paramsFilter.to_date
    }

    setParamsFilter({ ...paramsFilter, page: 1 })
  }

  const _getReportOrderToExportExcel = async () => {
    let reportNew = []
    try {
      setLoading(true)
      const res = await getReportOrder()
      if (res.status === 200) {
        res.data.data.map((e, index) => {
          reportNew.push({
            STT: index + 1,
            'Mã hàng': e.product ? e.product.code : '',
            'Tên hàng': e.product ? e.product.name : '',
            ĐVT: e.product ? e.product.unit : '',
            'Số lượng': formatCash(e.sale_quantity || 0),
            'Doanh thu': formatCash(e.total_revenue || 0),
            'Giá vốn': formatCash(e.base_price || 0),
            'Lợi nhuận gộp': formatCash(e.gross_profit || 0),
            '% Lợi nhuận': formatCash(e.profit_rate || 0),
          })
        })
      }
      setLoading(false)
      return reportNew
    } catch (error) {
      setLoading(false)
      console.log(error)
      return reportNew
    }
  }

  const _getReportOrder = async () => {
    try {
      setLoading(true)
      const res = await getReportOrder(paramsFilter)
      if (res.status === 200) {
        setCountReport(res.data.count)
        let reportNew = res.data.data.map((e) => ({
          code: e.product ? e.product.code : '',
          name: e.product ? e.product.name : '',
          unit: e.product ? e.product.unit : '',
          sale_quantity: e.sale_quantity || 0,
          total_revenue: e.total_revenue || 0,
          base_price: e.base_price || 0,
          gross_profit: e.gross_profit || 0,
          profit_rate: e.profit_rate || 0,
        }))

        setSalesReport([...reportNew])
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    _getReportOrder()
  }, [paramsFilter])

  return (
    <div className="card">
      <TitlePage
        title={
          <Row
            wrap={false}
            align="middle"
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(ROUTES.REPORTS)}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            Báo cáo bán hàng
          </Row>
        }
      >
        {/* <SettingColumns
          columnsDefault={columnsSalesReport}
          columns={columns}
          setColumns={setColumns}
          nameColumn="columnsSalesReport"
        /> */}
        <Button
          icon={<VerticalAlignTopOutlined />}
          onClick={async () => {
            const dataExport = await _getReportOrderToExportExcel()
            exportToCSV(dataExport, 'Báo cáo bán hàng')
          }}
          style={{ backgroundColor: 'green', borderColor: 'green' }}
          size="large"
          type="primary"
        >
          Xuất excel
        </Button>
      </TitlePage>

      <Row gutter={10} style={{ marginTop: 20, marginBottom: 20 }}>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <DatePicker.RangePicker
            value={dateFilter}
            onChange={onChangeDate}
            style={{ width: '100%' }}
            format={dateFormat}
          />
        </Col>
      </Row>

      <Table
        columns={columnsSalesReport.map((column) => {
          if (column.key === 'stt') return { ...column, render: (text, record, index) => index + 1 }
          if (column.key === 'code') return { ...column, sorter: (a, b) => compare(a, b, 'code') }
          if (column.key === 'name') return { ...column, sorter: (a, b) => compare(a, b, 'name') }
          if (column.key === 'unit') return { ...column, sorter: (a, b) => compare(a, b, 'unit') }
          if (column.key === 'sale_quantity')
            return {
              ...column,
              sorter: (a, b) => compare(a, b, 'sale_quantity'),
              render: (text, record) =>
                record.sale_quantity && formatCash(record.sale_quantity || 0),
            }
          if (column.key === 'total_revenue')
            return {
              ...column,
              sorter: (a, b) => compare(a, b, 'total_revenue'),
              render: (text, record) =>
                record.total_revenue && formatCash(record.total_revenue || 0),
            }
          if (column.key === 'gross_profit')
            return {
              ...column,
              sorter: (a, b) => compare(a, b, 'gross_profit'),
              render: (text, record) => record.gross_profit && formatCash(record.gross_profit || 0),
            }
          if (column.key === 'base_price')
            return {
              ...column,
              sorter: (a, b) => compare(a, b, 'base_price'),
              render: (text, record) => record.base_price && formatCash(record.base_price || 0),
            }
          if (column.key === 'profit_rate')
            return {
              ...column,
              sorter: (a, b) => compare(a, b, 'profit_rate'),
              render: (text, record) => record.profit_rate && formatCash(record.profit_rate || 0),
            }
          return column
        })}
        loading={loading}
        dataSource={salesReport}
        size="small"
        bordered
        pagination={{
          position: ['bottomLeft'],
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
          showQuickJumper: true,
          onChange: (page, pageSize) =>
            setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
          total: countReport,
        }}
        style={{ width: '100%' }}
        summary={(pageData) => (
          <Table.Summary.Row>
            <Table.Summary.Cell>
              <div style={{ fontWeight: 700 }}>Tổng</div>
            </Table.Summary.Cell>
            <Table.Summary.Cell></Table.Summary.Cell>
            <Table.Summary.Cell></Table.Summary.Cell>
            <Table.Summary.Cell></Table.Summary.Cell>
            <Table.Summary.Cell>
              <div style={{ fontWeight: 700 }}>
                {formatCash(pageData.reduce((total, current) => total + current.sale_quantity, 0))}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              <div style={{ fontWeight: 700 }}>
                {formatCash(pageData.reduce((total, current) => total + current.total_revenue, 0))}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              <div style={{ fontWeight: 700 }}>
                {formatCash(pageData.reduce((total, current) => total + current.base_price, 0))}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              <div style={{ fontWeight: 700 }}>
                {formatCash(pageData.reduce((total, current) => total + current.gross_profit, 0))}
              </div>
            </Table.Summary.Cell>
            <Table.Summary.Cell>
              <div style={{ fontWeight: 700 }}>
                {pageData.reduce((total, current) => total + current.profit_rate, 0)}
              </div>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  )
}
