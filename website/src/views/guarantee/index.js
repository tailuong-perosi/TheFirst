import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import moment from 'moment'
import { ROUTES, PERMISSIONS, FILTER_COL_HEIGHT, FILTER_SIZE } from 'consts'
import { compare } from 'utils'
import * as XLSX from 'xlsx'
import { useSelector } from 'react-redux'

//antd
import {
  Switch,
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  Table,
  notification,
  Upload,
  Space,
  Select,
} from 'antd'

//icons
import { FileExcelOutlined, PlusCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'

//apis
import { addWarranty, getWarranties, updateWarranty } from 'apis/warranty'
import { getEmployees } from 'apis/employee'

//components
import Permission from 'components/permission'
import exportToCSV from 'components/ExportCSV/export'
import TitlePage from 'components/title-page'
import ImportModal from 'components/ExportCSV/importModal'
import { convertFields, guarantee } from 'components/ExportCSV/fieldConvert'

const { RangePicker } = DatePicker
function removeFalse(a) {
  return Object.keys(a)
    .filter((key) => a[key] !== '' && a[key] !== undefined)
    .reduce((res, key) => ((res[key] = a[key]), res), {})
}
export default function Guarantee() {
  const history = useHistory()
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [users, setUsers] = useState([])
  const [warrantyList, setWarrantyList] = useState([])
  const [pagination, setPagination] = useState({ page: 1, page_size: 10 })
  const [showImport, setShowImport] = useState(false)
  const [importData, setImportData] = useState([])
  const [importLoading, setImportLoading] = useState(false)
  const [filter, setFilter] = useState({
    search: '',
    from_date: undefined,
    to_date: undefined,
    creator_id: undefined,
  })
  const onSearch = (value) => setFilter({ ...filter, search: value.target.value })
  function onChange(dates, dateStrings) {
    setFilter({ ...filter, from_date: dateStrings[0], to_date: dateStrings[1] })
  }

  const warrantyUpdate = async (id, data) => {
    try {
      console.log(data)
      const res = await updateWarranty(id, data)
      if (res.data.success) {
        notification.success({
          message: 'Thành công',
          description: `${data.active ? 'Kích hoạt' : 'Vô hiệu hóa'} thành công`,
        })
      }
    } catch (e) {
      console.log(e)
      notification.error({
        message: 'Thất bại',
        description: `${data.active ? 'Kích hoạt' : 'Vô hiệu hóa'} thất bại`,
      })
    }
  }
  const columnsPromotion = [
    {
      title: 'STT',
      width: 60,
      render(data, record, index) {
        return (pagination.page - 1) * pagination.page_size + index + 1
      },
    },
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      width: 150,
      sorter: (a, b) => compare(a, b, 'code'),
    },
    {
      title: 'Tên bảo hành',
      dataIndex: 'name',
      width: 150,
      sorter: (a, b) => compare(a, b, 'name'),
    },
    {
      title: 'Loại bảo hành',
      dataIndex: 'type',
      width: 150,
      sorter: (a, b) => compare(a, b, 'type'),
    },
    {
      title: 'Thời hạn bảo hành',
      dataIndex: 'time',
      width: 150,
      render(data) {
        return data + ' tháng'
      },
      sorter: (a, b) => a.time - b.time,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      width: 150,
      sorter: (a, b) => compare(a, b, 'description'),
    },
    {
      title: 'Người tạo',
      render: (text, record) =>
        record._creator && record._creator.first_name + ' ' + record._creator.last_name,
      sorter: (a, b) =>
        (a._creator && a._creator.first_name + ' ' + a._creator.last_name).length -
        (b._creator && b._creator.first_name + ' ' + b._creator.last_name).length,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      width: 150,
      render(data, record) {
        return (
          <Switch
            defaultChecked={data}
            onChange={(e) => warrantyUpdate(record.warranty_id, { active: e })}
          />
        )
      },
    },
  ]

  const settings = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    maxCount: 1,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        info.file.status = 'done'

        setImportLoading(true)
      }
      if (info.file.status == 'done') {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const bstr = e.target.result
          const workBook = XLSX.read(bstr, { type: 'binary' })
          const workSheetname = workBook.SheetNames[0]
          const workSheet = workBook.Sheets[workSheetname]

          const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 0 })
          setImportData(fileData.map((e) => convertFields(e, guarantee)))
          setImportLoading(false)
        }

        reader.readAsBinaryString(info.file.originFileObj)
      }
    },
  }

  const handleImport = async () => {
    console.log(importData)
    try {
      const res = await Promise.all(
        importData.map((e) => {
          return addWarranty(e)
        })
      )
      if (res.reduce((a, b) => a && b.data.success, true)) {
        setShowImport(false)
        setImportData([])
        getWarranty({ ...removeFalse(filter) })
        notification.success({ message: 'Import thành công' })
      } else {
        res.forEach((e, index) => {
          if (!e.data.success) {
            notification.error({
              message: 'Thất bại',
              description: `Dòng ${index + 1}: ${e.data.message} `,
            })
          }
        })
      }
    } catch (err) {
      console.log(err)
      notification.error({ message: 'Thất bại' })
    }
  }

  const changePagi = (page, page_size) => setPagination({ page, page_size })
  const getWarranty = async (params) => {
    try {
      const res = await getWarranties({
        ...params,
        ...pagination,
        _creator: true,
        branch_id: branchIdApp,
      })
      console.log(res)
      if (res.status == 200) {
        setWarrantyList(res.data.data)
      }
    } catch (e) {
      console.log(e)
    }
  }
  const ImportComponent = () => {
    return (
      <Upload {...settings}>
        <Button type="primary">Import</Button>
      </Upload>
    )
  }

  const _getUsers = async () => {
    try {
      const res = await getEmployees()
      if (res.status === 200) setUsers(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getUsers()
  }, [])

  useEffect(() => {
    getWarranty({ ...removeFalse(filter) })
  }, [filter, branchIdApp])

  return (
    <>
      <div className="card">
        <TitlePage
          title={
            <Row
              onClick={() => history.push(ROUTES.CONFIGURATION_STORE)}
              wrap={false}
              align="middle"
              style={{ cursor: 'pointer' }}
            >
              <ArrowLeftOutlined style={{ marginRight: 8 }} />
              <div>Quản lý bảo hành</div>
            </Row>
          }
        >
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              style={{ backgroundColor: '#004F88', color: 'white' }}
              size="large"
              onClick={() => setShowImport(true)}
            >
              Nhập excel
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              style={{ backgroundColor: '#008816', color: 'white' }}
              size="large"
              onClick={() =>
                exportToCSV(
                  warrantyList.map((e) => convertFields(e, guarantee, true)),
                  'bao_hanh'
                )
              }
            >
              Xuất excel
            </Button>
            <Permission permissions={[PERMISSIONS.them_phieu_bao_hanh]}>
              <Link to={ROUTES.GUARANTEE_ADD}>
                <Button
                  icon={<PlusCircleOutlined style={{ fontSize: '1rem' }} />}
                  type="primary"
                  size="large"
                >
                  Tạo phiếu bảo hành
                </Button>
              </Link>
            </Permission>
          </Space>
        </TitlePage>

        <Row wrap={false} style={{ marginTop: '1rem' }}>
          <Col xs={24} sm={24} md={21} lg={21} xl={21}>
            <Row style={{ border: '1px solid #d9d9d9', borderRadius: 5 }}>
              <Col xs={24} sm={24} md={8} lg={8} xl={8} style={{ height: FILTER_COL_HEIGHT }}>
                <Input
                  size={FILTER_SIZE}
                  placeholder="Tìm kiếm theo mã, theo tên"
                  value={filter.search}
                  onChange={onSearch}
                  enterButton
                  allowClear
                  bordered={false}
                />
              </Col>
              <Col
                xs={24}
                sm={24}
                md={8}
                lg={8}
                xl={8}
                style={{
                  borderLeft: '1px solid #d9d9d9',
                  borderRight: '1px solid #d9d9d9',
                  height: FILTER_COL_HEIGHT,
                }}
              >
                <RangePicker
                  size={FILTER_SIZE}
                  className="br-15__date-picker"
                  style={{ width: '100%' }}
                  ranges={{
                    Today: [moment(), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                  }}
                  value={filter.from_date ? [moment(filter.from_date), moment(filter.to_date)] : []}
                  onChange={onChange}
                  bordered={false}
                />
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} xl={8} style={{ height: FILTER_COL_HEIGHT }}>
                <Select
                  size={FILTER_SIZE}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  allowClear
                  showSearch
                  placeholder="Chọn người tạo"
                  style={{ width: '100%' }}
                  value={filter.creator_id}
                  onChange={(value) => {
                    if (value) filter.creator_id = value
                    else filter.creator_id = undefined

                    filter.page = 1
                    setFilter({ ...filter })
                  }}
                  bordered={false}
                >
                  {users.map((user, index) => (
                    <Select.Option key={index} value={user.user_id}>
                      {user.first_name || ''} {user.last_name || ''}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
          <Col xs={24} sm={24} md={2} lg={2} xl={2} style={{ marginLeft: 10 }}>
            <Button
              type="primary"
              danger
              onClick={() => {
                setFilter({
                  search: '',
                  from_date: undefined,
                  to_date: undefined,
                  creator_id: undefined,
                })
              }}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>

        <div
          style={{
            width: '100%',
            marginTop: '1rem',
            border: '1px solid rgb(243, 234, 234)',
          }}
        >
          <Table
            size="small"
            columns={columnsPromotion}
            pagination={{ onChange: changePagi }}
            dataSource={warrantyList}
            style={{ width: '100%' }}
          />
          <ImportModal
            visible={showImport}
            importLoading={importLoading}
            columns={[
              {
                title: 'Tên bảo hành',
                dataIndex: 'name',
                width: 150,
                sorter: (a, b) => compare(a, b, 'name'),
              },
              {
                title: 'Loại bảo hành',
                dataIndex: 'type',
                width: 150,
                sorter: (a, b) => compare(a, b, 'type'),
              },
              {
                title: 'Thời hạn bảo hành',
                dataIndex: 'time',
                width: 150,
                render(data) {
                  return data + ' tháng'
                },
                sorter: (a, b) => a.time - b.time,
              },
              {
                title: 'Mô tả',
                dataIndex: 'description',
                width: 150,
                sorter: (a, b) => compare(a, b, 'description'),
              },
            ]}
            downTemplate="./template/guarantee.xlsx"
            actionComponent={<ImportComponent />}
            dataSource={importData}
            onCancel={() => setShowImport(false)}
            onOk={handleImport}
          />
        </div>
      </div>
    </>
  )
}
