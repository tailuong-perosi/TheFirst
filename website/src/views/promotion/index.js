import styles from './../promotion/promotion.module.scss'
import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { PERMISSIONS, ROUTES, PAGE_SIZE, POSITION_TABLE } from 'consts'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

//antd
import {
  Popconfirm,
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  Select,
  Table,
  Modal,
  notification,
  Drawer,
  Form,
  InputNumber,
  Switch,
  Typography,
  Space,
} from 'antd'

//icon antd
import {
  PlusCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'

//components
import PromotionAdd from './promotion-form'
import Permission from 'components/permission'
import { compare, tableSum, formatCash } from 'utils'
import TitlePage from 'components/title-page'

//api
import { getPromotions, updatePromotion, deletePromotion } from 'apis/promotion'
import { getAllBranch } from 'apis/branch'
import { getEmployees } from 'apis/employee'
import { getAllStore } from 'apis/store'

//language
import { useTranslation } from 'react-i18next'

const { Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

export default function Promotion() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [visible, setVisible] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: PAGE_SIZE })
  const [listPromotion, setListPromotion] = useState()
  const [listBranch, setListBranch] = useState([])
  const [listStore, setListStore] = useState([])
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [searchFilter, setSearchFilter] = useState({})
  const [userList, setUserList] = useState([])
  const [valueUserFilter, setValueUserFilter] = useState(null)
  const [valueSearch, setValueSearch] = useState('')
  const typingTimeoutRef = useRef(null)
  const [dataUpdate, setDataUpdate] = useState([])
  const dispatch = useDispatch()
  const history = useHistory()

  const onClose = () => {
    setVisible(false)
  }
  function onChange(dates, dateStrings) {
    _getPromotions({ from_date: dateStrings[0], to_date: dateStrings[1] })
  }

  function handleChange(value) {
    _getPromotions({ type: value })
  }
  function handleChangeUserFilter(value) {
    _getPromotions({ creator_id: value })
  }

  // const columnsPromotion = [
  //   {
  //     title: t('promotion.information'),
  //     sorter: (a, b) => compare(a, b, 'name'),
  //     render: (data) => (
  //       <>
  //         <a
  //           href
  //           onClick={() => {
  //             setShowCreate(true)
  //             setDataUpdate(data)
  //           }}
  //         >
  //           {data.name}
  //         </a>
  //         {data.description && (
  //           <div>
  //             {t('promotion.description')}:{data.description}
  //           </div>
  //         )}
  //       </>
  //     ),
  //   },
  //   {
  //     title: t('promotion.promotion_type'),
  //     dataIndex: 'type',
  //     render(data) {
  //       return data == 'percent' ? t('promotion.percent') : t('promotion.value')
  //     },
  //     sorter: (a, b) => compare(a, b, 'type'),
  //   },
  //   {
  //     title: t('promotion.promotion_value'),
  //     dataIndex: 'value',
  //     render(data, record) {
  //       if (record.type.toLowerCase() === 'value') return formatCash(data.toString()) + ' VND'
  //       return formatCash(data.toString()) + '%'
  //     },
  //     sorter: (a, b) => compare(a, b, 'value'),
  //   },
  //   // {
  //   //   title: 'Người tạo',
  //   //   dataIndex: '_creator',
  //   //   render: (text, record) => `${text.first_name} ${text.last_name}`,
  //   //   sorter: (a, b) =>
  //   //     (a._creator && a._creator.first_name + ' ' + a._creator.last_name).length -
  //   //     (b._creator && b._creator.first_name + ' ' + b._creator.last_name).length,
  //   // },
  //   {
  //     title: t('promotion.promotion_quantity'),
  //     dataIndex: 'limit',
  //     render(data) {
  //       return data.amount
  //     },
  //     sorter: (a, b) => compare(a, b, 'limit'),
  //   },
  //   {
  //     title: t('promotion.applied_branch'),
  //     dataIndex: 'limit',
  //     sorter: (a, b) => compare(a, b, 'description'),
  //     render: (data) => {
  //       return data.stores
  //         .map((e) => {
  //           return listBranch.find((s) => s.branch_id === e)
  //             ? listBranch.find((s) => s.branch_id === e)['name']
  //             : undefined
  //         })
  //         .join(', ')
  //     },
  //   },
  //   {
  //     title: t('promotion.status'),
  //     dataIndex: 'active',
  //     render(data, record) {
  //       return (
  //         <Space size="middle">
  //           <Switch checked={data} onChange={(e) => onFinish(record.promotion_id, { active: e })} />
  //         </Space>
  //       )
  //     },
  //   },
  //   {
  //     title: t('promotion.action'),
  //     render(text, record) {
  //       return (
  //         <Popconfirm
  //           onConfirm={() => _deletePromotion(record.promotion_id)}
  //           title={t('promotion.ask_delete')}
  //           okText={t('promotion.yes')}
  //           cancelText={t('promotion.no')}
  //         >
  //           <Button type="primary" danger icon={<DeleteOutlined />} />
  //         </Popconfirm>
  //       )
  //     },
  //   },
  // ]
  const columnsPromotion = [
    {
      title: 'Mã khuyến mãi',
      width: '140px',
      dataIndex: 'promotion_code',
      sorter: (a, b) => compare(a, b, 'promotion_code'),
    },
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'name',
      sorter: (a, b) => compare(a, b, 'name'),
    },
    {
      title: 'Điều kiện áp dụng',
      dataIndex: 'order_value_require',
      sorter: (a, b) => compare(a, b, 'order_value_require'),
      render: (text, record) => <span>{formatCash(text)}</span>,
    },
    {
      title: 'Loại khuyến mãi',
      dataIndex: 'type',
      sorter: (a, b) => compare(a, b, 'type'),
      render: (text,record) => <span>{record.type === 'VALUE' ? 'Giá trị' : 'Phần trăm'}</span>,
    },
    {
      title: 'Giá trị khuyến mãi',
      dataIndex: 'value',
      sorter: (a, b) => compare(a, b, 'value'),
      render: (text, record) => <span>{formatCash(text)}</span>,
    },
    {
      title: 'Số lượng khuyến mãi',
      sorter: (a, b) => compare(a, b, 'limit.amount'),
      render: (text, record) => (record.limit_quantity !== 0 ? record.limit_quantity : 'Không giới hạn số lượng'),
    },
    {
      title: 'Thời hạn khuyến mãi',
      dataIndex: 'end_date',
      sorter: (a, b) => compare(a, b, 'end_date'),
    },
    {
      title: 'Hành động',
      dataIndex: 'is_active',
      sorter: (a, b) => compare(a, b, 'is_active'),
      render: (text, record) => (
        <Space size="middle">
          <Switch
            checked={text}
            onChange={(checked) => _updatePromotion(record.promotion_id, checked)}
          />
          <Popconfirm
            onConfirm={() => _deletePromotion(record.promotion_id)}
            title='Bạn muốn xoá khuyến mãi này?'
            okText='Đồng ý'
            cancelText='Không'
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space >
      ),
    },
  ]
  const openNotification = (e) => {
    notification.success({
      description: e ? 'Kích hoạt khuyến mãi thành công' : 'Hủy kích hoạt khuyến mãi thành công',
    })
  }

  const _updatePromotion = async (id, values) => {
    try {
      dispatch({ type: 'LOADING', data: true })
      const res = await updatePromotion(id, { is_active: values })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          openNotification(values)
          onClose()
          form.resetFields()
          _getPromotions()
        }
      } else {
        notification.error({ message: res.data.message })
      }
      dispatch({ type: 'LOADING', data: false })
    } catch (e) {
      console.log(e)
      dispatch({ type: 'LOADING', data: false })
    }
  }

  const _deletePromotion = async (value) => {
    try {
      console.log(value)
      const body = { promotion_id: [value] }
      const res = await deletePromotion(body)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          _getPromotions()
          notification.success({ message: 'Xóa khuyến mãi thành công' })
        } else
          notification.error({
            message: res.data.message || 'Xóa khuyến mãi thất bại',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa khuyến mãi thất bại',
        })
    } catch (err) {
      console.log(err)
    }
  }

  const getStore = async (params) => {
    try {
      const res = await getAllStore(params)
      if (res.data.success) {
        setListStore(res.data.data)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const _getUserList = async () => {
    try {
      const res = await getEmployees({ page: 1, page_size: 1000 })
      if (res.status === 200) {
        if (res.data.success) {
          setUserList(res.data.data)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  const changePagi = (page, page_size) => setPagination({ page, page_size })
  const _getPromotions = async (params) => {
    try {
      setLoading(true)
      const res = await getPromotions({ ...params, ...pagination, _creator: true })
      console.log(res)
      if (res.status === 200) {
        setListPromotion(res.data.data)
      } else {
        throw res
      }
      setLoading(false)
    } catch (e) {
      console.log(e)
      setLoading(false)
    }
  }
  const getBranch = async () => {
    try {
      const res = await getAllBranch()
      if (res.status === 200) {
        setListBranch(res.data.data)
      } else {
        throw res
      }
    } catch (e) {
      console.log(e)
    }
  }
  const resetFilter = () => {
    setSearchFilter({})
    setValueSearch(null)
  }

  const _search = (e) => {
    setValueSearch(e.target.value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(async () => {
      const value = e.target.value

      //khi search hoặc filter thi reset page ve 1
      searchFilter.page = 1

      if (value) searchFilter.name = value
      else delete searchFilter.name

      setSearchFilter({ ...searchFilter })
    }, 450)
  }
  useEffect(() => {
    getBranch()
    getStore()
    _getUserList()
  }, [])

  useEffect(() => {
    let tmp = { ...searchFilter }
    delete tmp['date']
    _getPromotions(tmp)
  }, [searchFilter, pagination])

  const ModalAddPromotion = ({ children, record }) => {
    const [isOpenSelect, setIsOpenSelect] = useState(false)
    const toggleOpenSelect = () => {
      setIsOpenSelect(!isOpenSelect)
    }

    return (
      <>
        <Button
          onClick={toggleOpenSelect}
          icon={<PlusCircleOutlined style={{ fontSize: '1rem' }} />}
          type="primary"
          size="middle"
          style={{
            display: 'block',
            margin: '0 auto',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '50%',
          }}
        >
          {children}
        </Button>
        <Modal
          style={{ top: 80 }}
          onCancel={toggleOpenSelect}
          width={800}
          footer={null}
          title={children}
          visible={isOpenSelect}
        >
          <PromotionAdd
            state={dataUpdate}
            close={toggleOpenSelect}
            reload={_getPromotions}
            show={showCreate}
          />
        </Modal>
      </>
    )
  }
  return (
    <>
      <div className="card">
        <TitlePage
          title={
            <Row
              // onClick={() => history.push(ROUTES.CONFIGURATION_STORE)}
              wrap={false}
              align="middle"
              style={{ cursor: 'pointer' }}
            >
              {/* <ArrowLeftOutlined style={{ marginRight: 8 }} /> */}
              <div>Quản lý khuyến mãi</div>
            </Row>
          }
        >
          <Space>
            <Permission permissions={[PERMISSIONS.them_khuyen_mai]}>
              <ModalAddPromotion>Thêm khuyến mãi</ModalAddPromotion>
            </Permission>
          </Space>
        </TitlePage>
        <Row style={{ marginTop: 15 }} justify="space-between">
          <Input
            style={{ width: '28%' }}
            placeholder="Tất cả loại khuyến mãi"
            // bordered={false}
            onChange={_search}
            allowClear
            value={valueSearch}
          />
          <Button
            type="primary"
            danger
            onClick={resetFilter}
            size="middle"
            icon={<DeleteOutlined />}
            style={{
              display: Object.keys(searchFilter).length == 0 && 'none',
              background: '#FF7089',
              border: 'none',
            }}
          >
            Xóa bộ lọc
          </Button>
          {/* <Col
            xs={24}
            sm={24}
            md={6}
            lg={6}
            xl={6}
            style={{ borderLeft: '1px solid #d9d9d9', borderRight: '1px solid #d9d9d9' }}
          >
            <RangePicker
              className="br-15__date-picker"
              style={{ width: '100%' }}
              bordered={false}
              ranges={{
                Today: [moment(), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
              }}
              value={searchFilter.date}
              onChange={(a, b) => {
                setSearchFilter({
                  ...searchFilter,
                  from_date: b[0],
                  to_date: b[1],
                  date: a,
                })
                onChange(a, b)
              }}
            />
          </Col>

          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Select
              style={{ width: '100%', borderRight: '1px solid #d9d9d9' }}
              allowClear
              bordered={false}
              placeholder="Lọc theo hình thức khuyến mãi"
              value={searchFilter.type}
              onChange={(e) => {
                setSearchFilter({ ...searchFilter, type: e })
                handleChange(e)
              }}
            >
              <Option value="percent">Phần trăm</Option>
              <Option value="value">Giá trị</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Select
              style={{ width: '100%' }}
              allowClear
              placeholder="Tìm kiếm theo người tạo"
              value={searchFilter.creator_id}
              bordered={false}
              onChange={(e) => {
                setSearchFilter({ ...searchFilter, creator_id: e })
                handleChangeUserFilter(e)
              }}
              showSearch
            >
              {userList.map((item) => {
                return (
                  <Option value={item.user_id}>
                    {item.first_name} {item.last_name}
                  </Option>
                )
              })}
            </Select>
          </Col> */}
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
            rowKey="promotion_id"
            loading={loading}
            // pagination={{ onChange: changePagi }}
            columns={columnsPromotion}
            dataSource={listPromotion}
            pagination={{
              position: POSITION_TABLE,
              current: pagination.page,
              pageSize: pagination.page_size,
              onChange(page, pageSize) {
                setPagination({
                  ...pagination,
                  page: page,
                  page_size: pageSize,
                })
              },
            }}
          // summary={(pageData) => {
          //   return (
          //     <Table.Summary fixed>
          //       <Table.Summary.Row>
          //         <Table.Summary.Cell>
          //           <Text>{t('promotion.total')}:</Text>
          //         </Table.Summary.Cell>
          //         <Table.Summary.Cell>
          //           <Text></Text>
          //         </Table.Summary.Cell>
          //         <Table.Summary.Cell>
          //           <Text>
          //             {t('promotion.percent')}:{' '}
          //             {pageData.reduce(
          //               (total, current) =>
          //                 total + (current.type === 'PERCENT' ? current.value : 0),
          //               0
          //             )}{' '}
          //             %
          //             <br />
          //             {t('promotion.value')}:{' '}
          //             {formatCash(
          //               pageData.reduce(
          //                 (total, current) =>
          //                   total + (current.type !== 'PERCENT' ? current.value : 0),
          //                 0
          //               )
          //             )}{' '}
          //             VND
          //           </Text>
          //         </Table.Summary.Cell>
          //         <Table.Summary.Cell>
          //           <Text>{formatCash(tableSum(pageData, 'limit.amount'))}</Text>
          //         </Table.Summary.Cell>
          //       </Table.Summary.Row>
          //     </Table.Summary>
          //   )
          // }}
          />
        </div>
        {/* {selectedRowKeys && selectedRowKeys.length > 0 ? ( */}
        {/* ) : (
          ''
        )} */}
      </div>

      {/* <Drawer
        title={t('promotion.edit_promotion')}
        width={1000}
        onClose={onClose}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form className={styles['promotion_add_form_parent']} onFinish={onFinish} form={form}>
          <Row className={styles['promotion_add_name']}>
            <Col
              className={styles['promotion_add_name_col']}
              style={{ marginBottom: '1rem' }}
              xs={24}
              sm={24}
              md={11}
              lg={11}
              xl={11}
            >
              <div className={styles['promotion_add_name_col_child']}>
                <div className={styles['promotion_add_form_left_title']}>
                  {t('promotion.promotion_program')}
                </div>
                <Form.Item
                  className={styles['promotion_add_name_col_child_title']}
                  // label="Username"
                  name="name"
                  rules={[{ required: true, message: t('promotion.enter_promotion_program') }]}
                >
                  <Input placeholder={t('promotion.enter_promotion_program')} disabled />
                </Form.Item>
              </div>
            </Col>
            <Col
              className={styles['promotion_add_name_col']}
              xs={24}
              sm={24}
              md={11}
              lg={11}
              xl={11}
            >
              <div className={styles['promotion_add_name_col_child']}>
                <div className={styles['promotion_add_form_left_title_parent']}>
                  {t('promotion.promotion_options')}
                </div>
                <Row className={styles['promotion_add_option']}>
                  <Col
                    className={styles['promotion_add_option_col']}
                    xs={24}
                    sm={24}
                    md={11}
                    lg={11}
                    xl={11}
                  >
                    <div className={styles['promotion_add_option_col_left']}>
                      <div
                        style={{ marginBottom: '0.5rem' }}
                        className={styles['promotion_add_option_col_left_title']}
                      >
                        Loại khuyến mãi
                      </div>
                      <div className={styles['promotion_add_option_col_left_percent']}>
                        <Form.Item
                          name="type"
                          noStyle
                          rules={[{ required: true, message: 'Giá trị rỗng' }]}
                        >
                          <Select
                            className={styles['promotion_add_form_left_select_child']}
                            placeholder="Theo phần trăm"
                          >
                            <Option value="percent">Phần trăm</Option>
                            <Option value="value">Giá trị</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          className={styles['promotion_add_name_col_child_title']}
                          // label="Username"
                          name="promotion_id"
                          rules={[{ required: true, message: 'Giá trị rỗng!' }]}
                        >
                          <Input hidden />
                        </Form.Item>
                      </div>
                    </div>
                  </Col>
                  <Col
                    className={styles['promotion_add_option_col']}
                    xs={22}
                    sm={22}
                    md={11}
                    lg={11}
                    xl={11}
                  >
                    <div className={styles['promotion_add_option_col_left']}>
                      <div
                        className={styles['promotion_add_option_col_left_title_left']}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        Giá trị khuyến mãi
                      </div>
                      <div className={styles['promotion_add_option_col_left_percent']}>
                        <Form.Item
                          className={styles['promotion_add_name_col_child_title']}
                          // label="Username"
                          name="value"
                          rules={[{ required: true, message: 'Giá trị rỗng!' }]}
                        >
                          <InputNumber
                            placeholder="Nhập giá trị"
                            min={1}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </Col>
                  <Col></Col>
                </Row>
              </div>
            </Col>
          </Row>
          <Row className={styles['promotion_add_name']}>
            <Col
              style={{ marginBottom: '1rem' }}
              className={styles['promotion_add_name_col']}
              xs={24}
              sm={24}
              md={11}
              lg={11}
              xl={11}
            >
              <div className={styles['promotion_add_name_col_child']}>
                <div className={styles['promotion_add_form_left_title_parent']}>
                  Giới hạn số lượng khuyến mãi
                </div>
                <Row className={styles['promotion_add_option']}>
                  <Col
                    className={styles['promotion_add_option_col']}
                    xs={24}
                    sm={24}
                    md={24}
                    lg={24}
                    xl={24}
                  >
                    <div className={styles['promotion_add_option_col_left']}>
                      <div
                        style={{ marginBottom: '0.5rem' }}
                        className={styles['promotion_add_option_col_left_title']}
                      >
                        Vourcher
                      </div>
                      <div className={styles['promotion_add_option_col_left_percent']}>
                        <Form.Item
                          className={styles['promotion_add_name_col_child_title']}
                          // label="Username"
                          name="amount"
                          rules={[{ required: true, message: 'Giá trị rỗng!' }]}
                        >
                          <Input placeholder="Nhập số lượng vourcher" />
                        </Form.Item>
                      </div>
                    </div>
                  </Col>
                  <Col
                    style={{ marginBottom: '1rem' }}
                    className={styles['promotion_add_option_col']}
                    xs={24}
                    sm={24}
                    md={24}
                    lg={24}
                    xl={24}
                  >
                    <div className={styles['promotion_add_option_col_left']}>
                      <div
                        className={styles['promotion_add_option_col_left_title_left_fix']}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        Chi nhánh
                      </div>
                      <div className={styles['promotion_add_option_col_left_percent']}>
                        <Form.Item
                          name="branch"
                          noStyle
                          rules={[{ required: true, message: 'Giá trị rỗng' }]}
                        >
                          <Select
                            mode="multiple"
                            className={styles['promotion_add_form_left_select_child']}
                            placeholder="Chọn chi nhánh"
                          >
                            {listBranch.map((e) => (
                              <Option value={e.branch_id}>{e.name}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col
              xs={24}
              sm={24}
              md={11}
              lg={11}
              xl={11}
              className={styles['promotion_add_form_right']}
            >
              <div className={styles['promotion_add_form_left_title']}>Mô tả</div>
              <div
                style={{ width: '100%', height: '100%' }}
                className={styles['promotion_add_form_right_content']}
              >
                <Input.TextArea
                  style={{ width: '100%', height: '100%' }}
                  rows={4}
                  placeholder="Nhập mô tả"
                />
              </div>
            </Col>
          </Row>

          <div className={styles['promotion_add_button']}>
            <Form.Item>
              <Button style={{ width: '7.5rem' }} type="primary" htmlType="submit">
                Lưu
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Drawer> */}
      <Drawer
        visible={showCreate}
        onClose={() => {
          setShowCreate(false)
          setDataUpdate([])
        }}
        title={
          dataUpdate.length === 0 ? 'Thêm khuyến mãi' : 'Cập nhật khuyến mãi'
        }
        width="75%"
      >
        <PromotionAdd
          state={dataUpdate}
          close={() => {
            setShowCreate(false)
          }}
          reload={_getPromotions}
          show={showCreate}
        />
      </Drawer>
    </>
  )
}
