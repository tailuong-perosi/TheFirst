import React, { useState, useEffect, useRef } from 'react'
import { ACTION, ROUTES, PERMISSIONS } from 'consts'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { compare } from 'utils'

//antd
import {
  DatePicker,
  Switch,
  InputNumber,
  Input,
  Button,
  notification,
  Table,
  Row,
  Form,
  Col,
  Typography,
  Drawer,
  Checkbox,
  Popconfirm
} from 'antd'

//icons
import { PlusCircleOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons'

//apis
import { addTax, getTaxs, updateTax, deleteTax } from 'apis/tax'

//components
import Permission from 'components/permission'
import TitlePage from 'components/title-page'

const { RangePicker } = DatePicker
const { Text } = Typography
const { TextArea } = Input
export default function Tax() {
  const history = useHistory()
  const dispatch = useDispatch()
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [tax, setTax] = useState([])
  const [visible, setVisible] = useState(false)
  const [visibleUpdate, setVisibleUpdate] = useState(false)
  const [visibleUpdateMulti, setVisibleUpdateMulti] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [loading, setLoading] = useState(false)
  const [defaultActive, setDefaultActive] = useState(false)
  const [arrayUpdate, setArrayUpdate] = useState([])
  const [form] = Form.useForm()

  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
    const array = []
    tax &&
      tax.length > 0 &&
      tax.forEach((values, index) => {
        selectedRowKeys.forEach((values1, index1) => {
          if (values._id === values1) {
            array.push(values)
          }
        })
      })
    setArrayUpdate([...array])
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }
  const showDrawerUpdateMulti = () => {
    setVisibleUpdateMulti(true)
  }

  const onCloseUpdateMulti = () => {
    setVisibleUpdateMulti(false)
  }
  const showDrawerUpdate = () => {
    setVisibleUpdate(true)
  }

  const onCloseUpdate = () => {
    setVisibleUpdate(false)
  }
  const showDrawer = () => {
    setVisible(true)
  }

  const onClose = () => {
    setVisible(false)
  }
  const apiSearchData = async (value) => {
    try {
      setLoading(true)

      const res = await getTaxs({ name: value })

      if (res.status === 200) setTax(res.data.data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  const typingTimeoutRef = useRef(null)
  const [valueSearch, setValueSearch] = useState('')
  const onSearch = (e) => {
    setValueSearch(e.target.value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      const value = e.target.value
      apiSearchData(value)
    }, 300)
    //
  }

  const openNotification = () => {
    notification.success({
      message: 'Th??nh c??ng',
      description: 'Th??m th??ng tin thu??? th??nh c??ng.',
    })
  }

  const openNotificationUpdateTax = () => {
    notification.error({
      message: 'Th???t b???i',
      description: 'T??n thu??? ph???i l?? ch???.',
    })
  }
  const openNotificationUpdateTaxError = () => {
    notification.error({
      message: 'Th???t b???i',
      description: 'T??n thu??? ???? t???n t???i.',
    })
  }
  const apiAllTaxData = async () => {
    try {
      setLoading(true)
      const res = await getTaxs({ branch_id: branchIdApp })
      console.log(res)
      if (res.status === 200) {
        setTax(res.data.data)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const apiAddTaxData = async (object) => {
    try {
      setLoading(true)
      const res = await addTax(object)
      if (res.status === 200) {
        await apiAllTaxData()
        setVisible(false)
        openNotification()
        form.resetFields()
      } else {
        notification.error({
          message: 'Th???t b???i',
          description: res.data.message,
        })
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  const onFinish = (values) => {
    if (!isNaN(values.taxName)) {
      openNotificationUpdateTax()
    } else {
      const object = {
        name: values.taxName,
        value: values.value,
        description: values && values.description ? values.description : '',
        default: defaultActive,
      }
      apiAddTaxData(object)
    }
  }

  function onChange(value) {
    console.log('changed', value)
  }
  const openNotificationUpdateMulti = (data) => {
    notification.success({
      message: 'Th??nh c??ng',
      description: (
        <div>
          C???p nh???t th??ng tin thu??? <b>{data}</b> th??nh c??ng.
        </div>
      ),
    })
  }
  const openNotificationDeleteSupplier = (data) => {
    notification.success({
      message: 'Th??nh c??ng',
      description: data === 2 ? 'V?? hi???u h??a thu??? th??nh c??ng.' : 'K??ch ho???t thu??? th??nh c??ng',
    })
  }
  const apiUpdateTaxDataStatus = async (object, id, data) => {
    try {
      setLoading(true)

      const res = await updateTax(object, id)
      if (res.status === 200) {
        await apiAllTaxData()
        openNotificationDeleteSupplier(data)
      } else {
        openNotificationUpdateTaxError()
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  function onChangeSwitch(checked, record) {
    const object = {
      active: checked,
    }
    apiUpdateTaxDataStatus(object, record.tax_id, checked ? 1 : 2)
  }
  const apiUpdateTaxData = async (object, id) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })

      const res = await updateTax(object, id)

      if (res.status === 200) {
        await apiAllTaxData()
        openNotificationUpdateMulti(object.name)
        onCloseUpdate()
        setSelectedRowKeys([])
        onCloseUpdateMulti()
      } else {
        openNotificationUpdateTaxError()
      }
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }
  const apiSearchDateData = async (start, end) => {
    try {
      setLoading(true)

      const res = await getTaxs({ from_date: start, to_date: end })
      if (res.status === 200) {
        setTax(res.data.data)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  const dateFormat = 'YYYY/MM/DD'
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [clear, setClear] = useState(-1)
  function onChangeDate(dates, dateStrings) {
    setClear(0)
    setStart(dateStrings && dateStrings.length > 0 ? dateStrings[0] : '')
    setEnd(dateStrings && dateStrings.length > 0 ? dateStrings[1] : '')
    apiSearchDateData(
      dateStrings && dateStrings.length > 0 ? dateStrings[0] : '',
      dateStrings && dateStrings.length > 0 ? dateStrings[1] : ''
    )
  }
  const openNotificationClear = () => {
    notification.success({
      message: 'Th??nh c??ng',
      description: 'D??? li???u ???? ???????c reset v??? ban ?????u.',
    })
  }
  const onClickClear = async () => {
    await apiAllTaxData()
    openNotificationClear()
    setValueSearch('')
    setClear(1)
    setSelectedRowKeys([])
    setStart([])
    setEnd([])
  }
  const onCloseUpdateFunc = (data) => {
    if (data === 1) {
      arrayUpdate &&
        arrayUpdate.length > 0 &&
        arrayUpdate.forEach((values, index) => {
          if (!isNaN(values.name)) {
            openNotificationUpdateTax()
          } else {
            const object = {
              name: values.name,
              value: values.value,
              description: values && values.description ? values.description : '',
            }
            apiUpdateTaxData(object, values.tax_id)
          }
        })
    } else {
      arrayUpdate &&
        arrayUpdate.length > 0 &&
        arrayUpdate.forEach((values, index) => {
          if (!isNaN(values.name)) {
            openNotificationUpdateTax()
          } else {
            const object = {
              name: values.name,
              value: arrayUpdate[0].value,
              description:
                arrayUpdate[0] && arrayUpdate[0].description ? arrayUpdate[0].description : '',
            }
            apiUpdateTaxData(object, values.tax_id)
          }
        })
    }
  }

  const _deleteTax = async (tax_id) => {
    try {
      setLoading(true)
      const res = await deleteTax({ tax_id: [tax_id] })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          apiAllTaxData()
          notification.success({ message: 'Xo?? thu??? th??nh c??ng!' })
        } else
          notification.error({
            message: res.data.message || 'Xo?? thu??? th???t b???i, vui l??ng th??? l???i!',
          })
      } else
        notification.error({
          message: res.data.message || 'Xo?? thu??? th???t b???i, vui l??ng th??? l???i!',
        })

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const columns = [
    {
      title: 'T??n thu???',
      dataIndex: 'name',
      sorter: (a, b) => compare(a, b, 'name'),
    },

    {
      title: 'Gi?? tr???',
      dataIndex: 'value',
      render: (text, record) => text && `${text}%`,
      sorter: (a, b) => compare(a, b, 'value'),
    },
    {
      title: 'M?? t???',
      dataIndex: 'description',
      sorter: (a, b) => compare(a, b, 'description'),
    },
    {
      title: 'Tr???ng th??i',
      dataIndex: 'active',
      render: (text, record) =>
        text ? (
          <Switch defaultChecked onChange={(e) => onChangeSwitch(e, record)} />
        ) : (
          <Switch onChange={(e) => onChangeSwitch(e, record)} />
        ),
    },
    {
      title: 'H??nh ?????ng',
      dataIndex: 'action',
      width: 100,
      render: (text, record) => <Popconfirm
        onConfirm={() => _deleteTax(record.tax_id)}
        title="B???n c?? mu???n x??a s???n ph???m n??y kh??ng?"
        okText="?????ng ??"
        cancelText="T??? ch???i"
      >
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
        />
      </Popconfirm>
    },
  ]

  useEffect(() => {
    apiAllTaxData()
  }, [branchIdApp])

  return (
    <>
      <div className="card">
        <TitlePage
          title={
            <Row
              align="middle"
              onClick={() => history.push(ROUTES.CONFIGURATION_STORE)}
              style={{ cursor: 'pointer' }}
            >
              <ArrowLeftOutlined />
              <div style={{ marginLeft: 8 }}>Qu???n l?? thu???</div>
            </Row>
          }
        >
          <Permission permissions={[PERMISSIONS.them_thue]}>
            <div onClick={showDrawer}>
              <Button size="large" type="primary" icon={<PlusCircleOutlined />}>
                Th??m thu???
              </Button>
            </div>
          </Permission>
        </TitlePage>

        <Row
          style={{
            margin: '1rem 0',
          }}
        >
          <Col
            style={{
              borderRight: 'none',
              border: '1px solid #d9d9d9',
              borderRadius: '5px 0px 0px 5px',
            }}
            xs={24}
            sm={24}
            md={11}
            lg={11}
            xl={7}
          >
            <Input
              style={{ width: '100%' }}
              name="name"
              value={valueSearch}
              enterButton
              onChange={onSearch}
              placeholder="T??m ki???m theo t??n"
              allowClear
              bordered={false}
            />
          </Col>
          <Col
            style={{ border: '1px solid #d9d9d9', borderRadius: '0px 5px 5px 0px' }}
            xs={24}
            sm={24}
            md={11}
            lg={11}
            xl={7}
          >
            <RangePicker
              className="br-15__date-picker"
              value={
                clear === 1
                  ? []
                  : start !== ''
                    ? [moment(start, dateFormat), moment(end, dateFormat)]
                    : []
              }
              style={{ width: '100%' }}
              ranges={{
                Today: [moment(), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
              }}
              onChange={onChangeDate}
              bordered={false}
            />
          </Col>
        </Row>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            marginBottom: '1rem',
          }}
        >
          <Button onClick={onClickClear} type="primary">
            X??a t???t c??? l???c
          </Button>
        </div>

        <div style={{ width: '100%', border: '1px solid rgb(243, 234, 234)' }}>
          <Table
            size="small"
            columns={columns}
            loading={loading}
            dataSource={tax}
            style={{ width: '100%' }}
            summary={(pageData) => {
              let totalTax = 0
              let totalValue = 0
              console.log(pageData)
              pageData
                .filter((e) => e.active)
                .forEach((values, index) => {
                  totalTax += parseInt(values.value)
                })

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>
                      <Text>
                        <div style={{ color: 'black', fontWeight: '600' }}>T???ng c???ng:</div>
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>
                        <div style={{ color: 'black', fontWeight: '600' }}>{`${totalTax}%`}</div>
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text></Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text></Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )
            }}
          />
        </div>
      </div>
      <Drawer
        title="Th??m th??ng tin thu???"
        width={720}
        onClose={onClose}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form onFinish={onFinish} layout="vertical" form={form}>
          <Row
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Col style={{ width: '100%' }} xs={24} sm={24} md={11} lg={11} xl={11}>
              <div>
                <Form.Item
                  label={<div style={{ color: 'black', fontWeight: '600' }}>T??n thu???</div>}
                  name="taxName"
                  rules={[{ required: true, message: 'Gi?? tr??? r???ng!' }]}
                >
                  <Input placeholder="Nh???p t??n thu???" size="large" />
                </Form.Item>
              </div>
            </Col>
            <Col style={{ width: '100%' }} xs={24} sm={24} md={11} lg={11} xl={11}>
              <div>
                <Form.Item
                  label={<div style={{ color: 'black', fontWeight: '600' }}>Gi?? tr??? (%)</div>}
                  name="value"
                  rules={[{ required: true, message: 'Gi?? tr??? r???ng!' }]}
                >
                  <InputNumber
                    size="large"
                    className="br-15__input"
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    onChange={onChange}
                  />
                </Form.Item>
              </div>
            </Col>
            <Col style={{ width: '100%' }} xs={24} sm={24} md={11} lg={11} xl={11}>
              <div>
                <div
                  style={{
                    color: 'black',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}
                >
                  M?? t???
                </div>
                <Form.Item name="description">
                  <TextArea rows={4} placeholder="Nh???p m?? t???" />
                </Form.Item>
              </div>
            </Col>
          </Row>

          <Row>
            <Checkbox onChange={(e) => setDefaultActive(e.target.checked)}>K??ch ho???t</Checkbox>
          </Row>
          <div
            style={{
              display: 'flex',
              maxWidth: '100%',
              overflow: 'auto',
              margin: '1rem 0',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <b style={{ marginRight: '0.25rem' }}>Ch?? ??:</b> b???n kh??ng th??? s???a gi?? tr??? thu??? khi ????
            s??? d???ng thu??? ???? trong m???t ????n h??ng ???? ?????t
          </div>

          <Row
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Col
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
              xs={24}
              sm={24}
              md={5}
              lg={4}
              xl={3}
            >
              <Form.Item>
                <Button size="large" type="primary" htmlType="submit">
                  L??u
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  )
}
