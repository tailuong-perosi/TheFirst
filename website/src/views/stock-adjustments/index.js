import React, { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import { ROUTES } from 'consts'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

//components
import columnsStock from './columns'
import SettingColumns from 'components/setting-columns'
import exportToCSV from 'components/ExportCSV/export'
import ImportCSV from 'components/ImportCSV'
import TitlePage from 'components/title-page'
import FilterDate from 'components/filter-date'
import { createCheckInventoryNote } from 'apis/inventory'
//antd
import { Row, Col, Input, Button, Space, Table, Select, Affix, notification } from 'antd'

//icons
import { SearchOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'

//apis
import { getCheckInventoryNote, importCheckInventoryNote } from 'apis/inventory'
import { getEmployees } from 'apis/employee'

export default function Reports() {
  const dispatch = useDispatch()
  const typingTimeoutRef = useRef(null)
  const { Option } = Select

  const [columns, setColumns] = useState([])
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [valueSearch, setValueSearch] = useState('')
  const [inventoryNote, setInventoryNote] = useState([])
  const [valueUserFilter, setValueUserFilter] = useState(null)
  const [userList, setUserList] = useState([])

  const _getCheckInventoryNote = async () => {
    try {
      dispatch({ type: 'LOADING', data: true })
      const res = await getCheckInventoryNote({ ...paramsFilter })
      console.log("ress",res)
      if (res.status === 200) setInventoryNote(res.data.data)
      dispatch({ type: 'LOADING', data: false })
    } catch (err) {
      console.log(err)
      dispatch({ type: 'LOADING', data: false })
    }
  }

  const _getUserList = async () => {
    try {
      const res = await getEmployees({ page: 1, page_size: 1000 })
      if (res.status === 200) {
        if (res.data.success) setUserList(res.data.data)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const _onSearch = (e) => {
    setValueSearch(e.target.value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      const value = e.target.value
      if (value) paramsFilter.code = value
      else delete paramsFilter.code
      setParamsFilter({ ...paramsFilter, page: 1 })
    }, 750)
  }

  const _onClearFilters = () => {
    setValueSearch('')
    setValueUserFilter()
    setParamsFilter({ page: 1, page_size: 20 })
  }

  const onChangeUserFilter = (value) => {
    setValueUserFilter(value)
    if (value) paramsFilter.creator_id = value
    else delete paramsFilter.creator_id
    setParamsFilter({ ...paramsFilter })
  }

  const _onFilter = (attribute = '', value = '') => {
    const paramsFilterNew = { ...paramsFilter }
    if (value) paramsFilterNew[attribute] = value
    else delete paramsFilterNew[attribute]
    setParamsFilter({ ...paramsFilterNew })
  }
  const _balance =async (value)=>
    {
      console.log("value",value)
     try{ 
      const body = { 
        branch_id:value.branch_id,
        products:[{
          product_id:value.product_id,
          variant_id:value.variant_id,
          system_quantity:value.total_quantity,
          real_quantity:value.real_quantity,
          diff_reason:value.diff_reason
        }] ,
        note: "",
         status: "BALANCED",
         balance: true,
        }
      console.log(body)
      let res
      res = await createCheckInventoryNote(body)
      if (res.status === 200) {
        if (res.data.success) {
          console.log("res",res)
          _getCheckInventoryNote()
          notification.success({
            message: `Cân bằng thành công`,
          })
        } else
          notification.error({
            message:
              res.data.message ||
              `Cân bằng thất bại!`,
          })
      }

     } 
      catch (err) {
        console.log(err)
     }
  }
  
  const _getStockAdjustmentToExport = async () => {
    let dataExport = []
    try {
      dispatch({ type: 'LOADING', data: true })
      const res = await getCheckInventoryNote()
      console.log(res)
      if (res.status === 200) {
        dataExport = res.data.data.map((item, index) => ({
          STT: index + 1,
          'Mã phiếu': item.code || '',
          'Kho kiểm hàng ': item?.branch?.name || '',
          'Trạng thái': item.status || '',
          'Ngày tạo': item.create_date || '',
          'Ngày kiểm': item.last_update || '',
          // 'Ngày kiểm': item.inventory_date || '',
          'Nhân viên tạo': item.creator_info.name || '',
          'Ghi chú': item.note || '',
        }))
      }
      dispatch({ type: 'LOADING', data: false })
      exportToCSV(dataExport, 'Phiếu kiểm hàng')
    } catch (e) {
      console.log(e)
      dispatch({ type: 'LOADING', data: false })
    }
  }

  useEffect(() => {
    _getCheckInventoryNote()
    _getUserList()
  }, [paramsFilter])

  return (
    <div className="card">
      <Affix offsetTop={60}>
        <TitlePage title="Phiếu kiểm hàng">
          <Space>
            <Button
              size="large"
              onClick={_onClearFilters}
              type="primary"
              danger
              style={{ display: Object.keys(paramsFilter).length <= 2 && 'none' }}
            >
              Xóa bộ lọc
            </Button>
            <Button
              size="large"
              onClick={_getStockAdjustmentToExport}
              icon={<VerticalAlignTopOutlined />}
              style={{ backgroundColor: 'green', borderColor: 'green', color: 'white' }}
            >
              Xuất excel
            </Button>
            <ImportCSV
              size="large"
              upload={importCheckInventoryNote}
              reload={_getCheckInventoryNote}
              title="Nhập phiếu kiểm hàng bằng file excel"
              fileTemplated="https://s3.ap-northeast-1.wasabisys.com/admin-order/2021/12/22/0da13f2d-cb35-4b73-beca-a8ba3dedb47a/NhapKhoAO.xlsx"
            />
            <SettingColumns
              columns={columns}
              setColumns={setColumns}
              columnsDefault={columnsStock}
              nameColumn="columnsStockAdjustments"
            />
            <Link to={ROUTES.STOCK_ADJUSTMENTS_CREATE}>
              <Button type="primary" size="large">
                Tạo phiếu kiểm
              </Button>
            </Link>
          </Space>
        </TitlePage>
      </Affix>
      <Row
        gutter={[0, 16]}
        style={{
          marginLeft: 0,
          marginRight: 0,
          marginTop: 15,
          border: '1px solid #d9d9d9',
          borderRadius: 5,
        }}
      >
        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
          <Input
            allowClear
            onChange={_onSearch}
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm theo mã phiếu kiểm hàng"
            bordered={false}
            value={valueSearch}
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={6}
          xl={6}
          style={{ borderRight: '1px solid #d9d9d9', borderLeft: '1px solid #d9d9d9' }}
        >
          <FilterDate paramsFilter={paramsFilter} setParamsFilter={setParamsFilter} />
        </Col>
        <Col xs={24} sm={24} md={24} lg={6} xl={6} style={{ borderRight: '1px solid #d9d9d9' }}>
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            showSearch
            bordered={false}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={paramsFilter.status}
            onChange={(value) => _onFilter('status', value)}
            style={{ width: '100%' }}
          >
            <Select.Option value="DRAFT">Lưu nháp</Select.Option>
            <Select.Option value="CHECKED">Đã kiểm</Select.Option>
            <Select.Option value="BALANCED">Đã cân bằng</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
          <Select
            onChange={onChangeUserFilter}
            value={valueUserFilter}
            style={{ width: '100%' }}
            placeholder="Lọc theo nhân viên tạo"
            allowClear
            showSearch
            optionFilterProp="children"
            bordered={false}
          >
            {userList.map((item, index) => {
              return (
                <Option value={item.user_id} key={index}>
                  {item.first_name} {item.last_name}
                </Option>
              )
            })}
          </Select>
        </Col>
      </Row>

      <Table
        size="small"
        scroll={{ y: 400 }}
        dataSource={inventoryNote}
        columns={columnsStock.map((column) => {
          if (column.key === 'stt')
            return {
              ...column,
              width: 50,
              render: (text, record, index) =>
                (paramsFilter.page - 1) * paramsFilter.page_size + index + 1,
            }
          if (column.key === 'code')
            return {
              ...column,
              render: (text, record) => (
                <Link to={{ pathname: ROUTES.STOCK_ADJUSTMENTS_UPDATE, state: record }}>
                  {record.code}
                </Link>
              ),
            }
          if (column.key === 'branch')
            return {
              ...column,
              render: (text, record) => record.branch && record.branch.name,
            }
          if (column.key === 'create_date')
            return {
              ...column,
              render: (text, record) => moment(record.create_date).format('DD/MM/YYYY, hh:mm'),
            }
          if (column.key === 'inventory_date')
            return {
              ...column,
              render: (text, record) =>
                record.last_update !== ''
                  ? moment(record.last_update).format('DD/MM/YYYY, hh:mm')
                  // ? moment(record.inventory_date).format('DD/MM/YYYY, hh:mm')
                  : 'Chưa kiểm',
            }
            if (column.key === 'note')
            return {
              ...column,
              render: (text, record) =>
            
                {
                  if (record.status!=="BALANCED")
                  {
                    return <Button type="primary" onClick={()=>_balance(record)}>Cân bằng</Button>
                  }
                }
                  
             
          }
          if (column.key === 'creator_info')
            return {
              ...column,
              render: (text, record) =>
                record.creator_info
                  ? record.creator_info.first_name + ' ' + record.creator_info.last_name
                  : '',
            }
          


          return column
        })}
        style={{ width: '100%', marginTop: 10 }}
        pagination={{
          position: ['bottomLeft'],
          current: paramsFilter.page,
          pageSize: paramsFilter.page_size,
          pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
          showQuickJumper: true,
          onChange: (page, pageSize) => {
            paramsFilter.page = page
            paramsFilter.page_size = pageSize
            setParamsFilter({ ...paramsFilter })
          },
          // total: countOrder,
        }}
      />
    </div>
  )
}
