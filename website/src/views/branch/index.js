import React, { useState, useEffect, useRef } from 'react'
import { ACTION, PERMISSIONS, IMAGE_DEFAULT, FILTER_COL_HEIGHT, FILTER_SIZE } from 'consts'
import { useDispatch } from 'react-redux'
import moment from 'moment'
import { compare } from 'utils'

//icons
import { SearchOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons'

//antd
import {
  Switch,
  Drawer,
  Input,
  Row,
  Col,
  DatePicker,
  notification,
  Select,
  Table,
  Button,
  Popover,
  Space,
  Popconfirm,
  Affix,
} from 'antd'

//components
import BranchForm from './branch-form'
import Permission from 'components/permission'
import TitlePage from 'components/title-page'
import SettingColumns from 'components/setting-columns'
import columnsBranch from './columns'

//apis
import { getDistricts, getProvinces } from 'apis/address'
import { getAllBranch, updateBranch, deleteBranch } from 'apis/branch'

const { Option } = Select
const { RangePicker } = DatePicker
export default function Branch() {
  const typingTimeoutRef = useRef(null)
  const dispatch = useDispatch()

  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState([])
  const [countBranch, setCountBranch] = useState(0)
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [districts, setDistricts] = useState([])
  const [provinces, setProvinces] = useState([])
  const [districtsDefault, setDistrictsDefault] = useState([])
  const [valueSearch, setValueSearch] = useState('')
  const [valueDate, setValueDate] = useState(null)

  function onChangeDate(date, dateStrings) {
    if (date) {
      setValueDate(date)
      paramsFilter.from_date = dateStrings[0]
      paramsFilter.to_date = dateStrings[1]
    } else {
      setValueDate(null)
      delete paramsFilter.from_date
      delete paramsFilter.to_date
    }
    setParamsFilter({ ...paramsFilter, page: 1 })
  }

  const onSearch = (e) => {
    setValueSearch(e.target.value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      const value = e.target.value

      if (value) paramsFilter.search = value
      else delete paramsFilter.search

      setParamsFilter({ ...paramsFilter, page: 1 })
    }, 750)
  }

  const _editBranch = async (body, id) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await updateBranch(body, id)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          dispatch({
            type: ACTION.LOGIN,
            data: { accessToken: res.data.accessToken },
          })
          _getBranches()
          notification.success({ message: 'Cập nhật thành công' })
        } else
          notification.error({
            message: res.data.message || 'Cập nhật thất bại, vui lòng thử lại!',
          })
      } else
        notification.error({ message: res.data.message || 'Cập nhật thất bại, vui lòng thử lại!' })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(error)
    }
  }

  const _getBranches = async () => {
    try {
      setLoading(true)
      const res = await getAllBranch({ ...paramsFilter, _creator: true })
      console.log(res)
      if (res.status === 200) {
        setBranches(res.data.data)
        setCountBranch(res.data.count)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const onClickClear = async () => {
    setParamsFilter({ page: 1, page_size: 20 })
    setValueSearch('')
    setValueDate(null)
  }

  const _deleteBranch = async (branch_id) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await deleteBranch(branch_id)
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Xóa chi nhánh thành công!' })
          _getBranches()
          dispatch({ type: 'TRIGGER_RELOAD_BRANCH' })
        } else
          notification.error({
            message: res.data.message || 'Xóa chi nhánh thất bại, vui lòng thử lại!',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa chi nhánh thất bại, vui lòng thử lại!',
        })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const _getDistricts = async () => {
    try {
      const res = await getDistricts()
      if (res.status === 200) {
        setDistricts(res.data.data)
        setDistrictsDefault(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const _getProvinces = async () => {
    try {
      const res = await getProvinces()
      if (res.status === 200) {
        setProvinces(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getBranches()
  }, [paramsFilter])

  useEffect(() => {
    _getProvinces()
    _getDistricts()
  }, [])

  return (
    <>
      <div className="card">
        <Affix offsetTop={60}>
        <TitlePage title="Danh sách chi nhánh">
          <Space>
            <SettingColumns
              columnsDefault={columnsBranch}
              columns={columns}
              setColumns={setColumns}
              nameColumn="columnsBranch"
            />
            <Permission permissions={[PERMISSIONS.them_chi_nhanh]}>
              <BranchForm reloadData={_getBranches}>
                <Button size="large" icon={<PlusCircleOutlined />} type="primary">
                  Thêm chi nhánh
                </Button>
              </BranchForm>
            </Permission>
          </Space>
        </TitlePage>
        </Affix>
        <div style={{ marginTop: 15 }}>
          <Row style={{ border: '1px solid #d9d9d9', borderRadius: 5, marginBottom: 10 }}>
            <Col xs={24} sm={24} md={12} lg={12} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
              <Input
                style={{ width: '100%' }}
                size={FILTER_SIZE}
                name="name"
                value={valueSearch}
                enterButton
                onChange={onSearch}
                placeholder="Tìm kiếm theo mã, theo tên"
                allowClear
                prefix={<SearchOutlined />}
                bordered={false}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              xl={6}
              style={{
                borderLeft: '1px solid #d9d9d9',
                borderRight: '1px solid #d9d9d9',
                height: FILTER_COL_HEIGHT,
              }}
            >
              <RangePicker
                size={FILTER_SIZE}
                className="br-15__date-picker"
                value={valueDate}
                style={{ width: '100%' }}
                ranges={{
                  Today: [moment(), moment()],
                  'This Month': [moment().startOf('month'), moment().endOf('month')],
                }}
                onChange={onChangeDate}
                bordered={false}
              />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              xl={6}
              style={{ borderRight: '1px solid #d9d9d9', height: FILTER_COL_HEIGHT }}
            >
              <Select
                allowClear
                size={FILTER_SIZE}
                style={{ width: '100%' }}
                placeholder="Tìm kiếm theo tỉnh/thành phố"
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={paramsFilter.province}
                onChange={(value) => {
                  if (value) {
                    paramsFilter.province = value
                    const districtsByProvince = districtsDefault.filter(
                      (e) => e.province_name === value
                    )
                    setDistricts([...districtsByProvince])
                  } else {
                    delete paramsFilter.province
                    setDistricts([...districtsDefault])
                  }

                  setParamsFilter({ ...paramsFilter, page: 1 })
                }}
                bordered={false}
              >
                {provinces.map((values, index) => {
                  return (
                    <Option value={values.province_name} key={index}>
                      {values.province_name}
                    </Option>
                  )
                })}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
              <Select
                allowClear
                size={FILTER_SIZE}
                style={{ width: '100%' }}
                placeholder="Tìm kiếm theo quận/huyện"
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={paramsFilter.district}
                onChange={(value) => {
                  if (value) paramsFilter.district = value
                  else delete paramsFilter.district

                  setParamsFilter({ ...paramsFilter, page: 1 })
                }}
                bordered={false}
              >
                {districts.map((values, index) => {
                  return (
                    <Option value={values.district_name} key={index}>
                      {values.district_name}
                    </Option>
                  )
                })}
              </Select>
            </Col>
          </Row>
          <Row>
            <Button
              style={{ display: Object.keys(paramsFilter).length < 3 && 'none' }}
              onClick={onClickClear}
              type="primary"
              size="large"
            >
              Xóa tất cả lọc
            </Button>
          </Row>
        </div>

        <Table
          style={{ width: '100%', marginTop: 5 }}
          rowKey="branch_id"
          size="small"
          scroll={{ y: 400 }}
          loading={loading}
          columns={columns.map((column) => {
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
                sorter: (a, b) => compare(a, b, 'code'),
                render: (text, record) => (
                  <BranchForm reloadData={_getBranches} record={record}>
                    <a>{record.code}</a>
                  </BranchForm>
                ),
              }
            if (column.key === 'name') return { ...column, sorter: (a, b) => compare(a, b, 'name') }
            if (column.key === 'create_date')
              return {
                ...column,
                render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : ''),
                sorter: (a, b) => moment(a.create_date).unix() - moment(b.create_date).unix(),
              }
            if (column.key === 'phone')
              return { ...column, sorter: (a, b) => compare(a, b, 'phone') }
            if (column.key === 'image')
              return {
                ...column,
                render: (text, record) => (
                  <Popover
                    content={
                      <img
                        src={record.logo || IMAGE_DEFAULT}
                        alt=""
                        style={{ width: 380, height: 380 }}
                      />
                    }
                  >
                    <img
                      src={record.logo || IMAGE_DEFAULT}
                      alt=""
                      style={{ width: 55, height: 55, objectFit: 'cover' }}
                    />
                  </Popover>
                ),
              }
            if (column.key === 'address')
              return {
                ...column,
                render: (text, record) =>
                  `${record.address && record.address + ', '}${
                    record.district && record.district + ', '
                  }${record.province && record.province}`,
              }
            if (column.key === 'creator')
              return {
                ...column,
                render: (text, record) =>
                  record._creator && record._creator.first_name + ' ' + record._creator.last_name,
                sorter: (a, b) =>
                  (a._creator && a._creator.first_name + ' ' + a._creator.last_name).length -
                  (b._creator && b._creator.first_name + ' ' + b._creator.last_name).length,
              }
            if (column.key === 'action')
              return {
                ...column,
                render: (text, record) => (
                  <Space size="middle">
                    <div>
                      <div>Mở bán</div>
                      <Switch
                        checked={record.active}
                        onChange={(checked) => _editBranch({ active: checked }, record.branch_id)}
                      />
                    </div>
                    <Popconfirm
                      onConfirm={() => _deleteBranch(record.branch_id)}
                      title="Bạn có muốn xóa chi nhánh này không?"
                      okText="Đồng ý"
                      cancelText="Từ chối"
                    >
                      <Button
                        style={{ marginTop: 17 }}
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Space>
                ),
              }

            return column
          })}
          dataSource={branches}
          pagination={{
            position: ['bottomLeft'],
            current: paramsFilter.page,
            pageSize: paramsFilter.page_size,
            pageSizeOptions: [20, 30, 50, 100],
            showQuickJumper: true,
            onChange: (page, pageSize) =>
              setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
            total: countBranch,
          }}
        />
      </div>
    </>
  )
}
