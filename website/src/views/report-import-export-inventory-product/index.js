import React, { useEffect, useState } from 'react'
import { formatCash } from 'utils'
import { useHistory } from 'react-router-dom'
import delay from 'delay'
import moment from 'moment'

//antd
import { Table, Row, Input, DatePicker, Col, Button, Tag } from 'antd'

//icons
import { ArrowLeftOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'

//components
import TitlePage from 'components/title-page'
import exportTableToCSV from 'components/ExportCSV/export-table'

//apis
import { getReportImportExportInventory } from 'apis/report'
import { ROUTES } from 'consts'

export default function ReportImportExportInventoryProduct() {
  const history = useHistory()

  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState([])
  const [countReport, setCountReport] = useState(0)
  const [paramsFilter, setParamsFilter] = useState({
    page: 1,
    page_size: 20,
    from_date: moment(new Date()).format('YYYY-MM-DD'),
    to_date: moment(new Date()).format('YYYY-MM-DD'),
  })
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

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Mã hàng',
      dataIndex: 'code',
    },
    {
      title: 'Tên hàng',
      dataIndex: 'name',
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
    },
    {
      title: 'Nhóm',
      render: (text, record) =>
        record._categories ? record._categories.map((category) => <Tag>{category.name}</Tag>) : '',
    },
    {
      title: 'Đầu kỳ',
      children: [
        {
          title: 'Số lượng',
          render: (text, record) => (record.begin_quantity ? formatCash(record.begin_quantity) : 0),
        },
        {
          title: 'Thành tiền',
          render: (text, record) => (record.begin_price ? formatCash(record.begin_price) : 0),
        },
      ],
    },
    {
      title: 'Nhập',
      children: [
        {
          title: 'Số lượng',
          render: (text, record) =>
            record.import_quantity ? formatCash(record.import_quantity) : 0,
        },
        {
          title: 'Thành tiền',
          render: (text, record) => (record.import_price ? formatCash(record.import_price) : 0),
        },
      ],
    },
    {
      title: 'Xuất',
      children: [
        {
          title: 'Số lượng',
          render: (text, record) =>
            record.export_quantity ? formatCash(record.export_quantity) : 0,
        },
        {
          title: 'Thành tiền',
          render: (text, record) => (record.export_price ? formatCash(record.export_price) : 0),
        },
      ],
    },
    {
      title: 'Cuối kỳ',
      children: [
        {
          title: 'Số lượng',
          render: (text, record) => (record.end_quantity ? formatCash(record.end_quantity) : 0),
        },
        {
          title: 'Thành tiền',
          render: (text, record) => (record.end_price ? formatCash(record.end_price) : 0),
        },
      ],
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
    },
  ]

  const _getReportImportExportInventory = async (query) => {
    try {
      setLoading(true)
      const res = await getReportImportExportInventory({ type: 'product', ...query })
      console.log(res)
      if (res.status === 200) {
        setReports(res.data.data.map((e) => ({ ...e.product, ...e })))
        setCountReport(res.data.count)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    _getReportImportExportInventory(paramsFilter)
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
            <ArrowLeftOutlined style={{ marginRight: 10 }} />
            Báo cáo xuất nhập tồn theo sản phẩm
          </Row>
        }
      >
        <Button
          icon={<VerticalAlignTopOutlined />}
          onClick={async () => {
            await _getReportImportExportInventory()
            await delay(300)
            exportTableToCSV('report-product', 'Báo cáo xuất nhập tồn theo sản phẩm')
          }}
          style={{ backgroundColor: 'green', borderColor: 'green' }}
          size="large"
          type="primary"
        >
          Xuất excel
        </Button>
      </TitlePage>

      <div>
        <Row>
          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <DatePicker.RangePicker
              value={dateFilter}
              onChange={onChangeDate}
              style={{ width: '100%', marginTop: 15, marginBottom: 25 }}
            />
          </Col>
        </Row>

        <div className="report-product" style={{ display: 'none' }}>
          <Table
            style={{ width: '100%' }}
            columns={columns}
            dataSource={reports}
            size="middle "
            bordered
            pagination={false}
            summary={(pageData) => (
              <Table.Summary.Row>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>Tổng</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(
                      pageData.reduce((value, current) => value + current.begin_quantity, 0)
                    )}
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(
                      pageData.reduce((value, current) => value + current.begin_price, 0)
                    )}
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(
                      pageData.reduce((value, current) => value + current.import_quantity, 0)
                    )}
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(
                      pageData.reduce((value, current) => value + current.import_price, 0)
                    )}
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(
                      pageData.reduce((value, current) => value + current.export_quantity, 0)
                    )}
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(
                      pageData.reduce((value, current) => value + current.export_price, 0)
                    )}
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(
                      pageData.reduce((value, current) => value + current.end_quantity, 0)
                    )}
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(pageData.reduce((value, current) => value + current.end_price, 0))}
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>

        <Table
          style={{ width: '100%' }}
          loading={loading}
          columns={columns}
          dataSource={reports}
          size="small"
          bordered
          pagination={{
            position: ['bottomLeft'],
            current: paramsFilter.page,
            defaultPageSize: 20,
            pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
            showQuickJumper: true,
            onChange: (page, pageSize) =>
              setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
            total: countReport,
          }}
          summary={(pageData) => (
            <Table.Summary.Row>
              <Table.Summary.Cell>
                <div style={{ fontWeight: 700 }}>Tổng</div>
              </Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell>
                <div style={{ fontWeight: 700 }}>
                  {formatCash(
                    pageData.reduce((value, current) => value + current.begin_quantity, 0)
                  )}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <div style={{ fontWeight: 700 }}>
                  {formatCash(pageData.reduce((value, current) => value + current.begin_price, 0))}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <div style={{ fontWeight: 700 }}>
                  {formatCash(
                    pageData.reduce((value, current) => value + current.import_quantity, 0)
                  )}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <div style={{ fontWeight: 700 }}>
                  {formatCash(pageData.reduce((value, current) => value + current.import_price, 0))}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <div style={{ fontWeight: 700 }}>
                  {formatCash(
                    pageData.reduce((value, current) => value + current.export_quantity, 0)
                  )}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <div style={{ fontWeight: 700 }}>
                  {formatCash(pageData.reduce((value, current) => value + current.export_price, 0))}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <div style={{ fontWeight: 700 }}>
                  {formatCash(pageData.reduce((value, current) => value + current.end_quantity, 0))}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <div style={{ fontWeight: 700 }}>
                  {formatCash(pageData.reduce((value, current) => value + current.end_price, 0))}
                </div>
              </Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </div>
    </div>
  )
}
