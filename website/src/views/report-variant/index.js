import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { formatCash } from 'utils'
import { useHistory } from 'react-router-dom'
import { FILTER_COL_HEIGHT, FILTER_SIZE, ROUTES } from 'consts'
import delay from 'delay'
import { useSelector } from 'react-redux'

//components
import TitlePage from 'components/title-page'
import exportTableToCSV from 'components/ExportCSV/export-table'

//antd
import { Input, Col, Row, DatePicker, Table, Tag, Button, Select, TreeSelect } from 'antd'

//icons
import { ArrowLeftOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'

//apis
import { getReportInventory } from 'apis/report'
import { getAllBranch } from 'apis/branch'
import { getCategories } from 'apis/category'

export default function ReportInventory() {
  const history = useHistory()
  const dateFormat = 'YYYY-MM-DD'
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [branches, setBranches] = useState([])
  const [categories, setCategories] = useState([])
  const [reportInventoryToExport, setReportInventoryToExport] = useState([])
  const [reportInventory, setReportInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [paramsFilter, setParamsFilter] = useState({
    page: 1,
    page_size: 20,
    from_date: moment(new Date()).format('YYYY-MM-DD'),
    to_date: moment(new Date()).format('YYYY-MM-DD'),
  })

  const [countReport, setCountReport] = useState(0)
  const [warehousesNameExport, setWarehousesNameExport] = useState([])
  const [warehousesName, setWarehousesName] = useState([])
  const [valueFilter, setValueFilter] = useState()

  const onChangeDate = (date, dateString) => {
    if (date) {
      paramsFilter.from_date = dateString[0]
      paramsFilter.to_date = dateString[1]
    } else {
      delete paramsFilter.from_date
      delete paramsFilter.to_date
    }

    setParamsFilter({ ...paramsFilter, page: 1 })
  }

  const _clearFilters = async () => {
    await _reportInventory()
    setValueFilter()
    setParamsFilter({ page: 1, page_size: 20 })
  }

  const columnsDefault = [
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
        record.categories ? record.categories.map((category) => <Tag>{category.name}</Tag>) : '',
    },
  ]

  const [columns, setColumns] = useState(columnsDefault)
  const [columnsExport, setColumnsExport] = useState(columnsDefault)

  const _reportInventory = async () => {
    try {
      setLoading(true)
      const res = await getReportInventory({ ...paramsFilter, type: 'variant' })
      console.log(res)
      if (res.status === 200) {
        setCountReport(res.data.count)
        const columnsNew = [...columnsDefault]
        let reportNew = []
        let warehousesNameNew = []
        res.data.data.map((e) => {
          let report = {
            code: e.variant ? e.variant.code : '',
            name: e.variant ? e.variant.title : '',
            unit: e.product ? e.product.unit : '',
            categories: e.product ? e.product._categories : [],
          }

          e.warehouse.map((w) => {
            if (w.branch) {
              report[w.branch.name] = { quantity: w.quantity || 0, price: w.price || 0 }
            }
          })

          reportNew.push(report)
        })

        res.data.data.map((e) => {
          e.warehouse.map((item) => {
            if (item.branch) {
              const findBranch = columnsNew.find((e) => e.title === item.branch.name)
              if (!findBranch) {
                const column = {
                  title: item.branch ? item.branch.name : '',
                  children: [
                    {
                      title: 'Số lượng',
                      render: (text, record) =>
                        record[item.branch ? item.branch.name : '']
                          ? formatCash(record[item.branch ? item.branch.name : ''].quantity || 0)
                          : 0,
                    },
                    {
                      title: 'Thành tiền',
                      render: (text, record) =>
                        record[item.branch ? item.branch.name : '']
                          ? formatCash(record[item.branch ? item.branch.name : ''].price || 0)
                          : 0,
                    },
                  ],
                }

                warehousesNameNew.push(item.branch ? item.branch.name : '')
                columnsNew.push(column)
              }
            }
          })
        })

        setWarehousesName([...warehousesNameNew])
        setReportInventory(reportNew)
        setColumns([...columnsNew])
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const _reportInventoryToExport = async () => {
    try {
      setLoading(true)
      const res = await getReportInventory({ type: 'variant' })
      if (res.status === 200) {
        setCountReport(res.data.count)
        const columnsNew = [...columnsDefault]
        let reportNew = []
        let warehousesNameNew = []

        res.data.data.map((e) => {
          let report = {
            code: e.product ? e.product.code : '',
            name: e.variant ? e.variant.title : '',
            unit: e.product ? e.product.unit : '',
            categories: e.product ? e.product._categories : [],
          }

          e.warehouse.map((w) => {
            if (w.branch) report[w.branch.name] = { quantity: w.quantity || 0, price: w.price || 0 }
          })

          reportNew.push(report)
        })

        res.data.data.map((e) => {
          e.warehouse.map((item) => {
            if (item.branch) {
              const findBranch = columnsNew.find((e) => e.title === item.branch.name)
              if (!findBranch) {
                const branchName = item.branch ? item.branch.name : ''
                const column = {
                  title: branchName,
                  children: [
                    {
                      title: 'Số lượng',
                      render: (text, record) =>
                        record[branchName] ? formatCash(record[branchName].quantity || 0) : 0,
                    },
                    {
                      title: 'Thành tiền',
                      render: (text, record) =>
                        record[branchName] ? formatCash(record[branchName].price || 0) : 0,
                    },
                  ],
                }

                warehousesNameNew.push(branchName)
                columnsNew.push(column)
              }
            }
          })
        })

        setWarehousesNameExport([...warehousesNameNew])
        setReportInventoryToExport([...reportNew])
        setColumnsExport([...columnsNew])
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const _getBranches = async () => {
    try {
      const res = await getAllBranch()
      if (res.status === 200) setBranches(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getCategories = async () => {
    try {
      const res = await getCategories()
      if (res.status === 200) setCategories(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getCategories()
    _getBranches()
  }, [])

  useEffect(() => {
    setParamsFilter({ ...paramsFilter, branch_id: branchIdApp })
    _clearFilters()
  }, [branchIdApp])

  useEffect(() => {
    _reportInventory()
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
            Báo cáo tồn kho theo thuộc tính
          </Row>
        }
      >
        <Button
          icon={<VerticalAlignTopOutlined />}
          onClick={async () => {
            await _reportInventoryToExport()
            await delay(300)
            exportTableToCSV('report-variant', 'Báo cáo tồn kho theo thuộc tính')
          }}
          style={{ backgroundColor: 'green', borderColor: 'green' }}
          size="large"
          type="primary"
        >
          Xuất excel
        </Button>
      </TitlePage>
      <Row
        wrap={false}
        gutter={[0, 16]}
        style={{
          marginLeft: 0,
          marginRight: 0,
          marginBottom: 20,
          marginTop: 20,
          border: '1px solid #d9d9d9',
          borderRadius: '5px',
        }}
      >
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={8}
          xl={8}
          style={{
            height: FILTER_COL_HEIGHT,
          }}
        >
          <DatePicker.RangePicker
            size={FILTER_SIZE}
            bordered={false}
            onChange={onChangeDate}
            style={{ width: '100%' }}
            format={dateFormat}
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={8}
          xl={8}
          style={{
            borderLeft: '1px solid #d9d9d9',
            borderRight: '1px solid #d9d9d9',
          }}
        >
          <Select
            size={FILTER_SIZE}
            allowClear
            bordered={false}
            value={paramsFilter.branch_id}
            onChange={(value) => {
              if (value) paramsFilter.branch_id = value
              else delete paramsFilter.branch_id
              setParamsFilter({ ...paramsFilter, page: 1 })
            }}
            placeholder="Lọc theo chi nhánh"
            style={{ width: '100%' }}
          >
            {branches.map((branch, index) => (
              <Select.Option value={branch.branch_id} key={index} 
              onChange={e => {
                setParamsFilter({ ...paramsFilter, type: e })
                setValueFilter(e)
              }}
              
              >
                {branch.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8} style={{ height: FILTER_COL_HEIGHT }}>
          <TreeSelect
            showCheckedStrategy={TreeSelect.SHOW_ALL}
            bordered={false}
            multiple
            size={FILTER_SIZE}
            treeDefaultExpandAll
            style={{ width: '100%' }}
            placeholder="Lọc theo nhóm sản phẩm"
            value={
              paramsFilter.category_id ? paramsFilter.category_id.split('---').map((e) => +e) : []
            }
            
            onChange={(value) => {
              
              if (value.length) setParamsFilter({ ...paramsFilter, category_id: value.join('---') })
              else {
                delete paramsFilter.category_id
                setParamsFilter({ ...paramsFilter })
              }
            }}
            allowClear
          >
            {categories.map((category) => (
              <TreeSelect.TreeNode value={category.category_id} title={category.name}>
                {category.children_category.map((child) => (
                  <TreeSelect.TreeNode value={child.category_id} title={child.name}>
                    {child.children_category &&
                      child.children_category.map((e) => (
                        <TreeSelect.TreeNode value={e.category_id} title={e.name}>
                          {e.name}
                        </TreeSelect.TreeNode>
                      ))}
                  </TreeSelect.TreeNode>
                ))}
              </TreeSelect.TreeNode>
            ))}
          </TreeSelect>
        </Col>
      </Row>
      <Button
        onClick={_clearFilters}
        style={{
          
          display: Object.keys(paramsFilter).length < 3 && 'none',
          width: '10%',
          marginBottom: 10,
        }}
        danger
        type="primary"
      >
        Xóa bộ lọc
      </Button>

      <div className="report-variant" style={{ display: 'none' }}>
        <Table
          bordered
          size="small"
          style={{ width: '100%' }}
          columns={columnsExport}
          dataSource={reportInventoryToExport}
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
              {warehousesNameExport.map((name) => (
                <>
                  <Table.Summary.Cell>
                    <div style={{ fontWeight: 700 }}>
                      {formatCash(
                        pageData.reduce(
                          (total, current) => total + (current[name] ? current[name].quantity : 0),
                          0
                        )
                      )}
                    </div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <div style={{ fontWeight: 700 }}>
                      {formatCash(
                        pageData.reduce(
                          (total, current) => total + (current[name] ? current[name].price : 0),
                          0
                        )
                      )}
                    </div>
                  </Table.Summary.Cell>
                </>
              ))}
            </Table.Summary.Row>
          )}
        />
      </div>

      <Table
        bordered
        loading={loading}
        size="small"
        scroll={{ y: 400 }}
        style={{ width: '100%' }}
        columns={columns}
        dataSource={reportInventory}
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
            {warehousesName.map((name) => (
              <>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(
                      pageData.reduce(
                        (total, current) => total + (current[name] ? current[name].quantity : 0),
                        0
                      )
                    )}
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <div style={{ fontWeight: 700 }}>
                    {formatCash(
                      pageData.reduce(
                        (total, current) => total + (current[name] ? current[name].price : 0),
                        0
                      )
                    )}
                  </div>
                </Table.Summary.Cell>
              </>
            ))}
          </Table.Summary.Row>
        )}
      />
    </div>
  )
}
