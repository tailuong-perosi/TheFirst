import React, { useEffect, useState } from 'react'
import styles from './import-inventory.module.scss'
import { useHistory, useLocation } from 'react-router-dom'
import { ROUTES, PERMISSIONS, IMAGE_DEFAULT, ACTION } from 'consts'
import { formatCash } from 'utils'
import moment from 'moment'
import noData from 'assets/icons/no-data.png'
import { useDispatch, useSelector } from 'react-redux'

//antd
import {
  Row,
  Col,
  Divider,
  Input,
  Button,
  Table,
  InputNumber,
  Form,
  Select,
  Radio,
  Spin,
  Tooltip,
  Space,
  DatePicker,
  Upload,
  Modal,
  notification,
} from 'antd'

//icons
import {
  ArrowLeftOutlined,
  CloseOutlined,
  InfoCircleTwoTone,
  SearchOutlined,
  PlusSquareOutlined,
  CreditCardFilled,
  LoadingOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

//apis
import { getProducts } from 'apis/product'
import { getAllBranch } from 'apis/branch'
import { uploadFile } from 'apis/upload'
import { getSuppliers } from 'apis/supplier'
import { getEmployees } from 'apis/employee'
import {
  createOrderImportInventory,
  updateOrderImportInventory,
  getOrdersImportInventory,
} from 'apis/inventory'
import { getTaxs } from 'apis/tax'

//components
import Permission from 'components/permission'
import TitlePage from 'components/title-page'
import delay from 'delay'

export default function ImportInventory() {
  const history = useHistory()
  const dispatch = useDispatch()
  const location = useLocation()
  const dataUser = useSelector((state) => state.login.dataUser)
  const [form] = Form.useForm()
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [tax, setTax] = useState([])
  const [valueTax, setValueTax] = useState('')
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [file, setFile] = useState('')
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [productsSearch, setProductsSearch] = useState([])
  const [importLocation, setImportLocation] = useState({})

  const [supplierId, setSupplierId] = useState()
  const [productsSupplier, setProductsSupplier] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [visibleProductsToSupplier, setVisibleProductsToSupplier] = useState(false)
  const toggleProductsToSupplier = () => {
    setVisibleProductsToSupplier(!visibleProductsToSupplier)
    setProductsSupplier([])
    setSelectedProducts([])
    setSupplierId()
  }

  //object order create
  const [orderCreate, setOrderCreate] = useState({
    order_details: [], //danh sách sản phẩm trong hóa đơn
    type_payment: 'PAID', //hình thức thanh toán
    sumCostPaid: 0, // tổng tiền của tất cả sản phẩm
    deliveryCharges: 0, //phí giao hàng
    moneyToBePaidByCustomer: 0, // tổng tiền khách hàng phải trả (Tổng tiền thanh toán)
  })

  const _editOrder = (attribute, value) => {
    const orderCreateNew = { ...orderCreate }
    orderCreateNew[attribute] = value

    //tổng tiền khách hàng phải trả (thành tiền)
    //tổng tiền sp + phí ship + VAT (mặc định 10%)
    orderCreateNew.moneyToBePaidByCustomer = +(
      orderCreateNew.sumCostPaid +
      orderCreateNew.deliveryCharges +
      (valueTax / 100) * orderCreateNew.moneyToBePaidByCustomer
    ).toFixed(0)

    form.setFieldsValue({ moneyToBePaidByCustomer: orderCreateNew.moneyToBePaidByCustomer })
    setOrderCreate({ ...orderCreateNew })
  }

  const _addProductToOrder = (product) => {
    if (product) {
      const orderCreateNew = { ...orderCreate }
      const indexProduct = orderCreateNew.order_details.findIndex((e) => e._id === product._id)

      if (indexProduct === -1) {
        orderCreateNew.order_details.push({ ...product, sumCost: product.import_price || 0 })

        // tổng tiền của tất cả sản phẩm
        orderCreateNew.sumCostPaid = orderCreateNew.order_details.reduce(
          (total, current) => total + current.sumCost,
          0
        )

        //tổng tiền khách hàng phải trả (thành tiền)
        //tổng tiền sp + phí ship + VAT (mặc định 10%)
        orderCreateNew.moneyToBePaidByCustomer = +(
          orderCreateNew.sumCostPaid +
          orderCreateNew.deliveryCharges +
          (10 / 100) * orderCreateNew.moneyToBePaidByCustomer
        ).toFixed(0)

        form.setFieldsValue({ moneyToBePaidByCustomer: orderCreateNew.moneyToBePaidByCustomer })
        setOrderCreate({ ...orderCreateNew })
      } else notification.warning({ message: 'Sản phẩm đã được thêm' })
    }
  }

  const _editProductInOrder = (attribute = '', value, index) => {
    if (index !== -1) {
      const orderCreateNew = { ...orderCreate }
      orderCreateNew.order_details[index][attribute] = value

      //tổng tiền của 1 sản phẩm
      orderCreateNew.order_details[index].sumCost =
        +orderCreateNew.order_details[index].quantity *
        +orderCreateNew.order_details[index].import_price

      // tổng tiền của tất cả sản phẩm
      orderCreateNew.sumCostPaid = orderCreateNew.order_details.reduce(
        (total, current) => total + current.sumCost,
        0
      )

      //tổng tiền khách hàng phải trả (thành tiền)
      //tổng tiền sp + phí ship + VAT (mặc định 10%)
      orderCreateNew.moneyToBePaidByCustomer = +(
        orderCreateNew.sumCostPaid +
        orderCreateNew.deliveryCharges +
        (10 / 100) * orderCreateNew.moneyToBePaidByCustomer
      ).toFixed(0)

      form.setFieldsValue({ moneyToBePaidByCustomer: orderCreateNew.moneyToBePaidByCustomer })
      setOrderCreate({ ...orderCreateNew })
    }
  }

  const _removeProductToOrder = (indexProduct) => {
    if (indexProduct !== -1) {
      const orderCreateNew = { ...orderCreate }
      orderCreateNew.order_details.splice(indexProduct, 1)

      // tổng tiền của tất cả sản phẩm
      orderCreateNew.sumCostPaid = orderCreateNew.order_details.reduce(
        (total, current) => total + current.sumCost,
        0
      )

      //tổng tiền khách hàng phải trả (thành tiền)
      //tổng tiền sp + phí ship + VAT (mặc định 10%)
      orderCreateNew.moneyToBePaidByCustomer = +(
        orderCreateNew.sumCostPaid +
        orderCreateNew.deliveryCharges +
        (10 / 100) * orderCreateNew.moneyToBePaidByCustomer
      ).toFixed(0)

      setOrderCreate({ ...orderCreateNew })
      form.setFieldsValue({ moneyToBePaidByCustomer: orderCreateNew.moneyToBePaidByCustomer })
    }
  }

  const columnsProductsToSupplier = [
    {
      title: 'Tên Sản phẩm',
      dataIndex: 'product_name',
    },
    {
      title: 'Phiên bản',
      dataIndex: 'title',
    },
    {
      title: 'Đơn giá nhập',
      dataIndex: 'import_price',
    },
  ]

  const columns = [
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
    },
    {
      title: 'Tên Sản phẩm',
      dataIndex: 'product_name',
    },
    {
      title: 'Phiên bản',
      dataIndex: 'title',
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'inventory_quantity',
    },
    {
      title: 'Số lượng nhập',
      render: (data, record) => (
        <InputNumber
          style={{ width: 70 }}
          onBlur={(event) => {
            const value = event.target.value.replaceAll(',', '')
            const indexProduct = orderCreate.order_details.findIndex((e) => e._id === record._id)
            _editProductInOrder('quantity', +value, indexProduct)
          }}
          defaultValue={record.quantity || 0}
          min={1}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          placeholder="Nhập số lượng nhập"
        />
      ),
    },
    {
      width: 130,
      title: 'Đơn giá nhập',
      render: (data, record) => (
        <InputNumber
          style={{ width: '100%' }}
          onBlur={(e) => {
            const value = e.target.value.replaceAll(',', '')
            const indexProduct = orderCreate.order_details.findIndex((e) => e._id === record._id)
            _editProductInOrder('import_price', +value, indexProduct)
          }}
          defaultValue={record.import_price || 0}
          min={0}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          placeholder="Nhập đơn giá nhập"
        />
      ),
    },
    {
      title: 'Tổng tiền',
      render: (text, record) =>
        record.sumCost && (
          <div style={{ whiteSpace: 'nowrap' }}>{formatCash(record.sumCost || 0)}</div>
        ),
    },
    {
      width: 25,
      title: '',
      render: (data, record, index) => (
        <DeleteOutlined
          style={{ color: 'red', fontSize: 16 }}
          onClick={() => _removeProductToOrder(index)}
        />
      ),
    },
  ]

  const _getBranches = async () => {
    try {
      const res = await getAllBranch()
      if (res.status === 200) {
        setBranches(res.data.data)

        // default value
        if (!location.state) {
          setImportLocation({ branch_id: dataUser && dataUser.data && dataUser.data.branch_id })
          form.setFieldsValue({
            import_location: dataUser && dataUser.data && dataUser.data.branch_id,
          })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _getUsers = async () => {
    try {
      const res = await getEmployees()
      if (res.status === 200) {
        setUsers(res.data.data)

        if (!location.state)
          form.setFieldsValue({
            order_creator_id: dataUser && dataUser.data && dataUser.data.user_id,
            receiver_id: dataUser && dataUser.data && dataUser.data.user_id,
          })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _uploadFile = async (file) => {
    try {
      setLoadingUpload(true)
      const url = await uploadFile(file)
      if (url) setFile(url)
      setLoadingUpload(false)
    } catch (error) {
      setLoadingUpload(false)
    }
  }

  const _addOrEditImportInventoryOrder = async (status = 'DRAFT') => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      await form.validateFields()
      const dataForm = form.getFieldsValue()

      let payment_info = {}

      if (dataForm.payment_status === 'PAID') {
        payment_info.paid_amount = dataForm.moneyToBePaidByCustomer
        payment_info.debt_amount = 0
      }

      if (dataForm.payment_status === 'PAYING') {
        const excessCash = dataForm.moneyToBePaidByCustomer - dataForm.paid
        payment_info.paid_amount = dataForm.paid
        payment_info.debt_amount = excessCash >= 0 ? excessCash : 0
      }

      if (dataForm.payment_status === 'UNPAID') {
        payment_info.paid_amount = 0
        payment_info.debt_amount = dataForm.moneyToBePaidByCustomer
      }

      const body = {
        ...dataForm,
        note: dataForm.note || '',
        code: dataForm.code || '',
        tags: dataForm.tags || [],
        import_location: { ...importLocation },
        products: orderCreate.order_details.map((e) => ({
          product_id: e.product_id,
          variant_id: e.variant_id,
          quantity: +e.quantity,
          import_price: +e.import_price,
        })),
        files: file ? [file] : [],
        complete_date: dataForm.complete_date ? new Date(dataForm.complete_date).toString() : null,
        total_cost: orderCreate.sumCostPaid || 0,
        total_tax: (10 / 100) * orderCreate.sumCostPaid,
        total_discount: 0,
        fee_shipping: orderCreate.deliveryCharges || 0,
        final_cost: orderCreate.moneyToBePaidByCustomer || 0,
        payment_info: [payment_info],
      }

      delete body.moneyToBePaidByCustomer
      delete body.paid
      console.log(body)
      let res
      if (location.state) res = await updateOrderImportInventory(body, location.state.order_id)
      else res = await createOrderImportInventory({ ...body, status: status })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({
            message: `${location.state ? 'Cập nhật' : 'Tạo'} đơn nhập hàng thành công`,
          })
          history.push(ROUTES.IMPORT_INVENTORIES)
        } else
          notification.error({
            message:
              res.data.message ||
              `${location.state ? 'Cập nhật' : 'Tạo'} đơn nhập hàng thất bại, vui lòng thử lại`,
          })
      } else
        notification.error({
          message:
            res.data.message ||
            `${location.state ? 'Cập nhật' : 'Tạo'} đơn nhập hàng thất bại, vui lòng thử lại`,
        })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(error)
    }
  }

  const _getSuppliers = async () => {
    try {
      const res = await getSuppliers()
      if (res.status === 200) setSuppliers(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getProductsByIds = async (ids) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await getProducts({ merge: true, detach: true, bulk_query: ids })
      if (res.status === 200) {
        const products = res.data.data.map((e) => ({
          ...e.variants,
          product_name: e.name,
          import_price: e.import_price_default || 0,
          quantity: 1,
          inventory_quantity: e.location && e.location[0] ? e.location[0].quantity : 0,
          sumCost: e.import_price_default || 0,
        }))

        _editOrder('order_details', products)
      }
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const _getProductsToSupplier = async (supplierId) => {
    try {
      setLoadingProduct(true)
      const res = await getProducts({ merge: true, detach: true, supplier_id: supplierId })
      if (res.status === 200) {
        const productsSupplierNew = res.data.data.map((e) => ({
          ...e.variants,
          product_name: e.name,
          import_price: e.import_price_default || 0,
          quantity: 1,
          inventory_quantity: e.location && e.location[0] ? e.location[0].quantity : 0,
          sumCost: e.import_price_default || 0,
        }))

        setProductsSupplier([...productsSupplierNew])
        setSelectedProducts(res.data.data.map((e) => e.product_id))
      }
      setLoadingProduct(false)
    } catch (error) {
      console.log(error)
      setLoadingProduct(false)
    }
  }

  const _getProductsSearch = async () => {
    try {
      setLoadingProduct(true)
      const res = await getProducts({ merge: true, detach: true, branch_id: branchIdApp })
      if (res.status === 200) {
        const productsSearchNew = res.data.data.map((e) => ({
          ...e.variants,
          product_name: e.name,
          import_price: e.import_price_default || 0,
          quantity: 1,
          inventory_quantity: e.location && e.location[0] ? e.location[0].quantity : 0,
          sumCost: e.import_price_default || 0,
        }))

        const query = new URLSearchParams(location.search)
        const _id = query.get('_id')
        if (_id) {
          const productFind = productsSearchNew.find((e) => e._id === _id)
          if (productFind) _addProductToOrder(productFind)
        }

        setProductsSearch([...productsSearchNew])
      }
      setLoadingProduct(false)
    } catch (error) {
      console.log(error)
      setLoadingProduct(false)
    }
  }

  const _getTaxs = async () => {
    try {
      const res = await getTaxs({ branch_id: branchIdApp })
      if (res.status === 200) {
        setTax(res.data.data.filter((data) => data.active === true))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _getOrderDetail = async (order_id) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await getOrdersImportInventory({ order_id: order_id })
      if (res.status === 200)
        if (res.data.data && res.data.data.length) {
          initOrder(res.data.data[0])
          await delay(100)
          form.setFieldsValue({ code: '', complete_date: '' })
        }
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(error)
    }
  }

  const initOrder = (orderDetail) => {
    setOrderCreate({
      order_details: orderDetail.products.map((e) => ({
        ...e.variant_info,
        product_name: e.product_info ? e.product_info.name : '',
        quantity: e.quantity || 0,
        import_price: e.import_price || 0,
        sumCost: +e.import_price * +e.quantity,
      })),
      type_payment: orderDetail.payment_status || '',
      sumCostPaid: orderDetail.total_cost || 0,
      deliveryCharges: orderDetail.fee_shipping || 0,
      moneyToBePaidByCustomer: orderDetail.final_cost || 0,
    })
    setImportLocation(orderDetail.import_location ? { ...orderDetail.import_location } : {})
    form.setFieldsValue({
      ...orderDetail,
      import_location: orderDetail.import_location ? orderDetail.import_location.branch_id : '',
      complete_date: orderDetail.complete_date ? moment(orderDetail.complete_date) : null,
      moneyToBePaidByCustomer: orderDetail.payment_amount || 0,
      paid: orderDetail.payment_amount || 0,
      order_creator_id: orderDetail.order_creator_id,
      receiver_id: orderDetail.receiver_id,
    })
  }

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const product_ids = query.get('product_ids')
    const order_id = query.get('order_id')
    if (order_id) _getOrderDetail(order_id)
    if (product_ids) _getProductsByIds(product_ids)
  }, [])

  useEffect(() => {
    _getBranches()
    _getSuppliers()
    _getProductsSearch()
    _getUsers()
    _getTaxs()
  }, [])

  useEffect(() => {
    if (!location.state)
      form.setFieldsValue({ payment_status: 'PAID', complete_date: moment(new Date()) })
    else initOrder(location.state)
  }, [])

  useEffect(() => {
    _editOrder()
  }, [valueTax])

  return (
    <div className="card">
      <Form layout="vertical" form={form}>
        <TitlePage
          isAffix={true}
          title={
            <Row
              onClick={() => history.push(ROUTES.IMPORT_INVENTORIES)}
              align="middle"
              style={{ color: 'black', cursor: 'pointer' }}
            >
              <ArrowLeftOutlined style={{ marginRight: 5 }} />
              {location.state ? 'Cập nhật' : 'Tạo'} đơn nhập hàng
            </Row>
          }
        >
          <Space>
            <Button
              style={{ display: location.state && 'none' }}
              size="large"
              type="primary"
              onClick={() => _addOrEditImportInventoryOrder()}
            >
              Lưu nháp
            </Button>
            <Button
              style={{ minWidth: 100 }}
              size="large"
              type="primary"
              onClick={() => _addOrEditImportInventoryOrder('COMPLETE')}
            >
              {location.state ? 'Lưu' : 'Tạo đơn hàng và hoàn tất'}
            </Button>
          </Space>
        </TitlePage>

        <Row gutter={30} style={{ marginTop: 25 }}>
          <Col span={16}>
            <div className={styles['block']}>
              <Row justify="space-between" align="middle" wrap={false}>
                <div className={styles['title']}>Sản phẩm</div>
                <Button type="link" onClick={toggleProductsToSupplier}>
                  Chọn nhanh từ nhà cung cấp
                </Button>
                <Modal
                  style={{ top: 20 }}
                  footer={null}
                  title="Chọn sản phẩm từ nhà cung cấp"
                  width={820}
                  visible={visibleProductsToSupplier}
                  onCancel={toggleProductsToSupplier}
                >
                  <Row justify="space-between" wrap={false} align="middle">
                    <Select
                      value={supplierId}
                      onChange={(value) => {
                        setSupplierId(value)
                        _getProductsToSupplier(value)
                      }}
                      showSearch
                      style={{ width: 250, marginBottom: 10 }}
                      placeholder="Chọn nhà cung cấp"
                    >
                      {suppliers.map((supplier, index) => (
                        <Select.Option key={index} value={supplier.supplier_id}>
                          {supplier.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Button
                      onClick={() => {
                        const products = productsSupplier.filter((product) =>
                          selectedProducts.includes(product.product_id)
                        )

                        _editOrder('order_details', products)
                        toggleProductsToSupplier()
                      }}
                      type="primary"
                      style={{ display: !productsSupplier.length && 'none' }}
                    >
                      Xác nhận
                    </Button>
                  </Row>
                  <Table
                    rowSelection={{
                      selectedRowKeys: selectedProducts,
                      onChange: setSelectedProducts,
                    }}
                    rowKey="product_id"
                    size="small"
                    loading={loadingProduct}
                    dataSource={productsSupplier}
                    columns={columnsProductsToSupplier}
                    pagination={false}
                    style={{ width: '100%' }}
                    scroll={{ y: '60vh' }}
                  />
                </Modal>
              </Row>
              <div className="select-product-sell">
                <Select
                  notFoundContent={loadingProduct ? <Spin size="small" /> : null}
                  dropdownClassName="dropdown-select-search-product"
                  allowClear
                  showSearch
                  clearIcon={<CloseOutlined style={{ color: 'black' }} />}
                  suffixIcon={<SearchOutlined style={{ color: 'black', fontSize: 15 }} />}
                  style={{ width: '100%', marginBottom: 15 }}
                  placeholder="Thêm sản phẩm vào hoá đơn"
                  dropdownRender={(menu) => (
                    <div>
                      <Permission permissions={[PERMISSIONS.them_san_pham]}>
                        <Row
                          wrap={false}
                          align="middle"
                          style={{ cursor: 'pointer' }}
                          onClick={() => window.open(ROUTES.PRODUCT_ADD, '_blank')}
                        >
                          <div
                            style={{
                              paddingLeft: 15,
                              width: 45,
                              height: 50,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <PlusSquareOutlined style={{ fontSize: 19 }} />
                          </div>
                          <p style={{ marginLeft: 20, marginBottom: 0, fontSize: 16 }}>
                            Thêm sản phẩm mới
                          </p>
                        </Row>
                      </Permission>
                      {menu}
                    </div>
                  )}
                >
                  {productsSearch.map((data, index) => (
                    <Select.Option value={data.title} key={data.title + index + ''}>
                      <Row
                        align="middle"
                        wrap={false}
                        style={{ padding: '7px 13px' }}
                        onClick={(e) => {
                          _addProductToOrder(data)
                          e.stopPropagation()
                        }}
                      >
                        <img
                          src={data.image[0] ? data.image[0] : IMAGE_DEFAULT}
                          alt=""
                          style={{
                            minWidth: 40,
                            minHeight: 40,
                            maxWidth: 40,
                            maxHeight: 40,
                            objectFit: 'cover',
                          }}
                        />

                        <div style={{ width: '100%', marginLeft: 15 }}>
                          <Row wrap={false} justify="space-between">
                            <span
                              style={{
                                maxWidth: 200,
                                marginBottom: 0,
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                display: '-webkit-box',
                              }}
                            >
                              {data.title}
                            </span>
                            <p style={{ marginBottom: 0, fontWeight: 500 }}>
                              {formatCash(data.price)}
                            </p>
                          </Row>
                          {/* <Row wrap={false} justify="space-between">
                              <p style={{ marginBottom: 0, color: 'gray' }}>{data.sku}</p>
                              <p
                                style={{
                                  marginBottom: 0,
                                  color: data.locations && data.locations.length ? 'gray' : 'red',
                                }}
                              >
                                Số lượng hiện tại:{' '}
                                {formatCash(
                                  data.locations && data.locations.length
                                    ? data.locations[0].quantity
                                    : 0
                                )}
                              </p>
                            </Row> */}
                        </div>
                      </Row>
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <Table
                scroll={{ y: 400 }}
                sticky
                pagination={false}
                columns={columns}
                size="small"
                dataSource={[...orderCreate.order_details]}
                locale={{
                  emptyText: (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 200,
                      }}
                    >
                      <img src={noData} alt="" style={{ width: 90, height: 90 }} />
                      <h4 style={{ fontSize: 15, color: '#555' }}>
                        Đơn hàng của bạn chưa có sản phẩm
                      </h4>
                    </div>
                  ),
                }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row
                      style={{ display: orderCreate.order_details.length === 0 && 'none' }}
                    >
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={3}>
                        <div style={{ fontSize: 14.4 }}>
                          <Row wrap={false} justify="space-between">
                            <div>Tổng tiền ({orderCreate.order_details.length} sản phẩm)</div>
                            <div>
                              {orderCreate.sumCostPaid ? formatCash(+orderCreate.sumCostPaid) : 0}
                            </div>
                          </Row>
                          <Row wrap={false} justify="space-between">
                            <div>THUẾ</div>
                            {/* <div>{formatCash(orderCreate.VAT || 0)}</div> */}
                            {/* <div>10%</div> */}
                            <Select
                              showSearch
                              style={{ width: 120 }}
                              placeholder="Chọn thuế"
                              optionFilterProp="children"
                              allowClear
                            >
                              {tax.map((item) => (
                                <Select.Option value={item.tax_id}>
                                  <div
                                    onClick={() => {
                                      setValueTax(item.value)
                                      _editOrder('tax', item.value)
                                    }}
                                  >
                                    {item.name} {item.value} %
                                  </div>
                                </Select.Option>
                              ))}
                            </Select>
                          </Row>
                          <Row wrap={false} justify="space-between">
                            <div>Chiết khấu</div>
                            <div>
                              0
                              {/* {formatCash(orderCreate.discount ? orderCreate.discount.value : 0)}{' '}
                                {orderCreate.discount
                                  ? orderCreate.discount.type === 'VALUE'
                                    ? ''
                                    : '%'
                                  : ''} */}
                            </div>
                          </Row>
                          <Row wrap={false} justify="space-between" align="middle">
                            <div>Phí giao hàng</div>
                            <div>
                              <InputNumber
                                style={{ minWidth: 120 }}
                                onBlur={(e) => {
                                  const value = e.target.value.replaceAll(',', '')
                                  _editOrder('deliveryCharges', +value)
                                }}
                                min={0}
                                size="small"
                                formatter={(value) =>
                                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                }
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                defaultValue={orderCreate.deliveryCharges}
                              />
                            </div>
                          </Row>
                          <Row wrap={false} justify="space-between" style={{ fontWeight: 600 }}>
                            <div>Thành tiền thanh toán</div>
                            <div>{formatCash(+orderCreate.moneyToBePaidByCustomer || 0)}</div>
                          </Row>
                        </div>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
            <div className={styles['block']} style={{ marginTop: 30 }}>
              <Row wrap={false} align="middle" style={{ fontWeight: 600 }}>
                <CreditCardFilled style={{ fontSize: 17, marginRight: 5 }} />
                <div>PHƯƠNG THỨC THANH TOÁN</div>
              </Row>
              <div style={{ marginTop: 10 }}>
                <Form.Item name="payment_status">
                  <Radio.Group onChange={(e) => _editOrder('type_payment', e.target.value)}>
                    <Space size="small" direction="vertical">
                      <Radio value="PAID">Đã thanh toán toàn bộ</Radio>
                      <Radio value="PAYING">Thanh toán một phần</Radio>
                      <Radio value="UNPAID">Thanh toán sau</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </div>
              <Divider />

              {orderCreate.type_payment === 'UNPAID' && (
                <div>
                  <div>Thành tiền cần thanh toán (bao gồm VAT)</div>
                  <Form.Item
                    name="moneyToBePaidByCustomer"
                    rules={[{ required: true, message: 'Vui lòng nhập thành tiền cần thanh toán' }]}
                  >
                    <InputNumber
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      style={{ width: '45%' }}
                      placeholder="Nhập thành tiền cần thanh toán"
                    />
                  </Form.Item>
                </div>
              )}
              {orderCreate.type_payment === 'PAYING' && (
                <Row justify="space-between">
                  <div style={{ width: '45%' }}>
                    <div>Thành tiền cần thanh toán (bao gồm VAT)</div>
                    <Form.Item
                      name="moneyToBePaidByCustomer"
                      rules={[
                        { required: true, message: 'Vui lòng nhập thành tiền cần thanh toán' },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        style={{ width: '100%' }}
                        placeholder="Nhập thành tiền cần thanh toán"
                      />
                    </Form.Item>
                  </div>

                  <div style={{ width: '45%' }}>
                    <div>Số tiền đã trả</div>
                    <Form.Item
                      name="paid"
                      rules={[{ required: true, message: 'Vui lòng nhập số tiền đã trả' }]}
                    >
                      <InputNumber
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        style={{ width: '100%' }}
                        placeholder="Nhập số tiền đã trả"
                      />
                    </Form.Item>
                  </div>
                </Row>
              )}

              {orderCreate.type_payment === 'PAID' && (
                <div>
                  <div>Thành tiền cần thanh toán (bao gồm VAT)</div>
                  <Form.Item
                    name="moneyToBePaidByCustomer"
                    rules={[{ required: true, message: 'Vui lòng nhập thành tiền cần thanh toán' }]}
                  >
                    <InputNumber
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      style={{ width: '45%' }}
                      placeholder="Nhập thành tiền cần thanh toán"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </Col>

          <Col span={8}>
            <div className={styles['block']} style={{ marginBottom: 30 }}>
              <div className={styles['title']}>Thông tin đơn hàng</div>
              <Form.Item
                label="Mã đơn hàng"
                name="code"
                rules={[{ required: true, message: 'Vui lòng nhập mã đơn hàng!' }]}
              >
                <Input placeholder="Nhập mã đơn hàng" />
              </Form.Item>
              <Form.Item
                name="import_location"
                label="Địa điểm nhận hàng"
                rules={[{ required: true, message: 'Vui lòng chọn địa điểm nhận hàng!' }]}
              >
                <Select
                  value=""
                  showSearch
                  optionFilterProp="children"
                  placeholder="Chọn địa điểm nhận hàng"
                  style={{ width: '100%' }}
                  onChange={(value, option) => {
                    console.log(value)
                    let p = {}
                    if (value) {
                      const branchFind = branches.find((e) => e.branch_id === value)
                      if (branchFind) p.branch_id = branchFind.branch_id
                    }
                    setImportLocation({ ...p })
                  }}
                >
                  {branches.map((e, index) => (
                    <Select.Option value={e.branch_id} key={index}>
                      {e.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Ngày nhập hàng"
                name="complete_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày nhập hàng!' }]}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  placeholder="Chọn ngày giao"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                rules={[{ required: true, message: 'Vui lòng chọn người tạo đơn!' }]}
                label="Người tạo đơn"
                name="order_creator_id"
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Chọn nhân viên lên đơn"
                  defaultValue={dataUser && dataUser.data && dataUser.data.user_id}
                >
                  {users.map((user, index) => (
                    <Select.Option value={user.user_id} key={index}>
                      {user.first_name + ' ' + user.last_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                // rules={[{ required: true, message: 'Vui lòng chọn người xác nhận phiếu!' }]}
                label="Người xác nhận phiếu"
                name="receiver_id"
              >
                <Select
                  allowClear
                  defaultValue={dataUser && dataUser.data && dataUser.data.user_id}
                  showSearch
                  optionFilterProp="children"
                  placeholder="Chọn người xác nhận phiếu"
                >
                  {users.map((user, index) => (
                    <Select.Option value={user.user_id} key={index}>
                      {user.first_name + ' ' + user.last_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className={styles['block']}>
              <div className={styles['title']}>Hóa đơn </div>
              <div>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  showUploadList={false}
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  data={_uploadFile}
                >
                  {file ? (
                    <img src={file} alt="avatar" style={{ width: '100%' }} />
                  ) : (
                    <div>
                      {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>Tải hóa đơn</div>
                    </div>
                  )}
                </Upload>
              </div>

              <div className={styles['title']}>
                Ghi chú{' '}
                <Tooltip
                  title={
                    <div style={{ textAlign: 'center' }}>
                      Thêm thông tin ghi chú phục vụ cho việc xem thông tin và xử lý đơn hàng. (VD:
                      đơn giao trong ngày, giao trong giờ hành chính...)
                    </div>
                  }
                >
                  <InfoCircleTwoTone style={{ fontSize: 12 }} />
                </Tooltip>
              </div>
              <Form.Item name="note">
                <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
              </Form.Item>

              <div className={styles['title']}>
                Tag{' '}
                <Tooltip
                  title={
                    <div style={{ textAlign: 'center' }}>
                      Chọn hoặc thêm các thẻ cho đơn hàng, thẻ này phục vụ cho việc lọc các đơn (VD:
                      Đơn giao gấp, đơn nội thành...)
                    </div>
                  }
                >
                  <InfoCircleTwoTone style={{ fontSize: 12 }} />
                </Tooltip>
              </div>
              <Form.Item name="tags">
                <Select mode="tags" placeholder="Nhập tags"></Select>
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
