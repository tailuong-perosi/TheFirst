import React, { useEffect, useState } from 'react'
import styles from './order-create-shipping.module.scss'
import { useHistory } from 'react-router-dom'
import { ROUTES, PERMISSIONS, IMAGE_DEFAULT } from 'consts'
import { formatCash } from 'utils'
import moment from 'moment'
import jwt_decode from 'jwt-decode'
import CryptoJS from 'crypto-js'
import { useSelector } from 'react-redux'

//antd
import {
  Row,
  Col,
  Divider,
  Input,
  Button,
  Table,
  InputNumber,
  notification,
  Modal,
  Form,
  Select,
  Radio,
  Spin,
  Tooltip,
  Space,
  Affix,
  DatePicker,
  Tabs,
} from 'antd'

//icons
import {
  ArrowLeftOutlined,
  CloseCircleTwoTone,
  CheckOutlined,
  PlusSquareFilled,
  UserOutlined,
  CloseOutlined,
  InfoCircleTwoTone,
  SearchOutlined,
  PlusSquareOutlined,
  CreditCardFilled,
  CarFilled,
  CarOutlined,
  ShopOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import noData from 'assets/icons/no-data.png'

//apis
import { getPromotions } from 'apis/promotion'
import { getProducts } from 'apis/product'
import { getCustomers } from 'apis/customer'
import { getAllBranch } from 'apis/branch'
import { getTaxs } from 'apis/tax'

//components
import Permission from 'components/permission'
import CustomerForm from 'views/customer/customer-form'
import ChangeDelivery from './change-delivery'
import ModalPromotion from './promotion'
import TitlePage from 'components/title-page'
import { apiOrderVoucher } from 'apis/order'

export default function OrderCreateShipping() {
  let history = useHistory()
  const [formInfoOrder] = Form.useForm()
  const branchIdApp = useSelector((state) => state.branch.branchId)
  console.log(branchIdApp)

  const [loadingProduct, setLoadingProduct] = useState(false)
  const [productsSearch, setProductsSearch] = useState([])
  const [productData, setProductData] = useState([])
  console.log(productData)
  const [options, setOptions] = useState([])
  const [infoBranch, setInfoBranch] = useState(
    localStorage.getItem('branchSell') ? JSON.parse(localStorage.getItem('branchSell')) : null
  )

  //object order create
  const [orderCreate, setOrderCreate] = useState({
    name: 'Đơn 1',
    type: 'default',
    customer: null,
    order_details: [], //danh sách sản phẩm trong hóa đơn
    payments: [], //hình thức thanh toán
    type_payment: 'Thanh toán sau', //hình thức thanh toán
    sumCostPaid: 0, // tổng tiền của tất cả sản phẩm
    discount: null,
    VAT: 0,
    noteInvoice: '',
    salesChannel: '', //kênh bán hàng
    isDelivery: true, //mặc định là hóa đơn giao hàng
    deliveryCharges: 0, //phí giao hàng
    deliveryAddress: null, //địa chỉ nhận hàng
    shipping: null, //đơn vị vận chuyển
    billOfLadingCode: '',
    moneyToBePaidByCustomer: 0, // tổng tiền khách hàng phải trả
    prepay: 0, //tiền khách thanh toán trước
    moneyGivenByCustomer: 0, //tiền khách hàng đưa
    excessCash: 0, //tiền thừa
  })

  console.log(orderCreate)

  const [note, setNote] = useState('')
  const [taxList, setTaxList] = useState([])
  const [promotionList, setPromotionList] = useState([])
  const [promotion, setPromotion] = useState('')
  const [taxValue, setTaxValue] = useState(5)
  const [tax, setTax] = useState(['1'])
  const [voucher, setvoucher] = useState('')
  const [discount, setDiscount] = useState('')

  const [loadingBranch, setLoadingBranch] = useState(false)
  const [branches, setBranches] = useState([])
  const branchActive =
    localStorage.getItem('branchSell') && JSON.parse(localStorage.getItem('branchSell'))

  const [loadingCustomer, setLoadingCustomer] = useState(false)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [customers, setCustomers] = useState([])
  const [deliveryAddress, setDeliveryAddress] = useState(null)
  const [visibleCustomerUpdate, setVisibleCustomerUpdate] = useState(false)

  const _editOrder = (attribute, value) => {
    const orderCreateNew = { ...orderCreate }
    orderCreateNew[attribute] = value

    //tổng tiền khách hàng phải trả
    orderCreateNew.moneyToBePaidByCustomer =
      orderCreateNew.sumCostPaid +
      orderCreateNew.VAT +
      (orderCreateNew.isDelivery ? orderCreateNew.deliveryCharges : 0)

    //discount có 2 loại
    //nếu type = value thì cộng
    // nếu type = percent thì nhân
    if (orderCreateNew.discount) {
      if (orderCreateNew.discount.type === 'VALUE')
        orderCreateNew.moneyToBePaidByCustomer -= +orderCreateNew.discount.value
      else
        orderCreateNew.moneyToBePaidByCustomer -=
          (+orderCreateNew.discount.value / 100) * orderCreateNew.moneyToBePaidByCustomer
    }

    //tiền thừa
    const excessCashNew =
      (orderCreateNew.isDelivery ? orderCreateNew.prepay : orderCreateNew.moneyGivenByCustomer) -
      orderCreateNew.moneyToBePaidByCustomer

    orderCreateNew.excessCash = excessCashNew >= 0 ? excessCashNew : 0

    setOrderCreate({ ...orderCreateNew })
  }

  const _addProductToOrder = (product) => {
    if (product) {
      //check product có đủ số lượng
      if (product.total_quantity !== 0) {
        const orderCreateNew = { ...orderCreate }
        const indexProduct = orderCreateNew.order_details.findIndex((e) => e._id === product._id)

        //nếu đã có sẵn trong cart rồi thì tăng số lượng và tổng tiền của sản phẩm đó lên
        //nếu chưa có thì push vào giỏ hàng
        if (indexProduct !== -1) {
          if (orderCreateNew.order_details[indexProduct].quantity < product.total_quantity) {
            orderCreateNew.order_details[indexProduct].quantity++

            orderCreateNew.order_details[indexProduct].sumCost =
              +orderCreateNew.order_details[indexProduct].quantity *
              +orderCreateNew.order_details[indexProduct].price

            //thuế VAT của mỗi sản phẩm
            orderCreateNew.order_details[indexProduct].VAT_Product =
              orderCreateNew.order_details[indexProduct]._taxes &&
              orderCreateNew.order_details[indexProduct]._taxes.length
                ? (
                    (orderCreateNew.order_details[indexProduct]._taxes.reduce(
                      (total, current) => total + current.value,
                      0
                    ) /
                      100) *
                    orderCreateNew.order_details[indexProduct].sumCost
                  ).toFixed(0)
                : 0
          } else
            notification.warning({
              message: 'Sản phẩm không đủ số lượng để bán, vui lòng chọn sản phẩm khác!',
            })
        } else
          orderCreateNew.order_details.push({
            ...product,
            unit: '', //đơn vị
            quantity: 1, //số lượng sản phẩm
            sumCost: product.price, // tổng giá tiền
            VAT_Product:
              product._taxes && product._taxes.length
                ? (
                    (product._taxes.reduce((total, current) => total + current.value, 0) / 100) *
                    product.price
                  ).toFixed(0)
                : 0,
          })

        // tổng tiền của tất cả sản phẩm
        orderCreateNew.sumCostPaid = orderCreateNew.order_details.reduce(
          (total, current) => total + current.sumCost,
          0
        )

        //tổng thuế VAT của tất cả sản phẩm
        orderCreateNew.VAT = orderCreateNew.order_details.reduce(
          (total, current) => total + +current.VAT_Product,
          0
        )

        //tổng tiền khách hàng phải trả
        orderCreateNew.moneyToBePaidByCustomer =
          orderCreateNew.sumCostPaid +
          orderCreateNew.VAT +
          (orderCreateNew.isDelivery ? orderCreateNew.deliveryCharges : 0)

        //discount có 2 loại
        //nếu type = value thì cộng
        // nếu type = percent thì nhân
        if (orderCreateNew.discount) {
          if (orderCreateNew.discount.type === 'VALUE')
            orderCreateNew.moneyToBePaidByCustomer -= +orderCreateNew.discount.value
          else
            orderCreateNew.moneyToBePaidByCustomer -=
              (+orderCreateNew.discount.value / 100) * orderCreateNew.moneyToBePaidByCustomer
        }

        //tiền thừa
        const excessCashNew =
          (orderCreateNew.isDelivery
            ? orderCreateNew.prepay
            : orderCreateNew.moneyGivenByCustomer) - orderCreateNew.moneyToBePaidByCustomer

        orderCreateNew.excessCash = excessCashNew >= 0 ? excessCashNew : 0

        setOrderCreate({ ...orderCreateNew })
      } else
        notification.warning({
          message: 'Sản phẩm không đủ số lượng để bán, vui lòng chọn sản phẩm khác!',
        })
    }
  }

  const _editProductInOrder = (attribute, value, index) => {
    if (index !== -1) {
      const orderCreateNew = { ...orderCreate }
      orderCreateNew.order_details[index][attribute] = value

      //tổng tiền của 1 sản phẩm
      orderCreateNew.order_details[index].sumCost =
        +orderCreateNew.order_details[index].quantity * +orderCreateNew.order_details[index].price

      //thuế VAT của mỗi sản phẩm
      orderCreateNew.order_details[index].VAT_Product =
        orderCreateNew.order_details[index]._taxes &&
        orderCreateNew.order_details[index]._taxes.length
          ? (
              (orderCreateNew.order_details[index]._taxes.reduce(
                (total, current) => total + current.value,
                0
              ) /
                100) *
              orderCreateNew.order_details[index].sumCost
            ).toFixed(0)
          : 0

      //tổng thuế VAT của tất cả các sản phẩm
      orderCreateNew.VAT = orderCreateNew.order_details.reduce(
        (total, current) => total + +current.VAT_Product,
        0
      )

      // tổng tiền của tất cả sản phẩm
      orderCreateNew.sumCostPaid = orderCreateNew.order_details.reduce(
        (total, current) => total + current.sumCost,
        0
      )

      //tổng tiền khách hàng phải trả
      orderCreateNew.moneyToBePaidByCustomer =
        orderCreateNew.sumCostPaid +
        orderCreateNew.VAT +
        (orderCreateNew.isDelivery ? orderCreateNew.deliveryCharges : 0)

      //discount có 2 loại
      //nếu type = value thì cộng
      // nếu type = percent thì nhân
      if (orderCreateNew.discount) {
        if (orderCreateNew.discount.type === 'VALUE')
          orderCreateNew.moneyToBePaidByCustomer -= +orderCreateNew.discount.value
        else
          orderCreateNew.moneyToBePaidByCustomer -=
            (+orderCreateNew.discount.value / 100) * orderCreateNew.moneyToBePaidByCustomer
      }

      //tiền thừa
      const excessCashNew =
        (orderCreateNew.isDelivery ? orderCreateNew.prepay : orderCreateNew.moneyGivenByCustomer) -
        orderCreateNew.moneyToBePaidByCustomer

      orderCreateNew.excessCash = excessCashNew >= 0 ? excessCashNew : 0

      setOrderCreate({ ...orderCreateNew })
    }
  }

  const _removeProductToOrder = (indexProduct) => {
    if (indexProduct !== -1) {
      const orderCreateNew = { ...orderCreate }
      orderCreateNew.order_details.splice(indexProduct, 1)

      //tổng thuế VAT của tất cả các sản phẩm
      orderCreateNew.VAT = orderCreateNew.order_details.reduce(
        (total, current) => total + +current.VAT_Product,
        0
      )

      // tổng tiền của tất cả sản phẩm
      orderCreateNew.sumCostPaid = orderCreateNew.order_details.reduce(
        (total, current) => total + current.sumCost,
        0
      )

      //tổng tiền khách hàng phải trả
      orderCreateNew.moneyToBePaidByCustomer =
        orderCreateNew.sumCostPaid +
        orderCreateNew.VAT +
        (orderCreateNew.isDelivery ? orderCreateNew.deliveryCharges : 0)

      //discount có 2 loại
      //nếu type = value thì cộng
      // nếu type = percent thì nhân
      if (orderCreateNew.discount) {
        if (orderCreateNew.discount.type === 'VALUE')
          orderCreateNew.moneyToBePaidByCustomer -= +orderCreateNew.discount.value
        else
          orderCreateNew.moneyToBePaidByCustomer -=
            (+orderCreateNew.discount.value / 100) * orderCreateNew.moneyToBePaidByCustomer
      }

      //tiền thừa
      const excessCashNew =
        (orderCreateNew.isDelivery ? orderCreateNew.prepay : orderCreateNew.moneyGivenByCustomer) -
        orderCreateNew.moneyToBePaidByCustomer

      orderCreateNew.excessCash = excessCashNew >= 0 ? excessCashNew : 0

      setOrderCreate({ ...orderCreateNew })
    }
  }

  const ModalCustomerForm = ({ children, record }) => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)
    return (
      <>
        <div onClick={toggle}>{children}</div>
        <Modal
          style={{ top: 20 }}
          onCancel={toggle}
          width={800}
          footer={null}
          title={`${record ? 'Cập nhật' : 'Tạo'} khách hàng`}
          visible={visible}
        >
          <CustomerForm
            record={record}
            close={toggle}
            text={record ? 'Lưu' : 'Tạo'}
            reload={_getCustomers}
          />
        </Modal>
      </>
    )
  }

  const _getCustomerAfterEditCustomer = async () => {
    try {
      setLoadingCustomer(true)
      const res = await getCustomers({ customer_id: customerInfo.customer_id })
      if (res.status === 200) if (res.data.data.length) setCustomerInfo(res.data.data[0])
      setLoadingCustomer(false)
    } catch (error) {
      setLoadingCustomer(false)
      console.log(error)
    }
  }

  const columns = [
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'title',
    },
    {
      title: 'Số lượng',
      render: (data, record) => (
        // console.log(record)
        <InputNumber
          style={{ width: 70 }}
          onBlur={(e) => {
            const value = e.target.value.replaceAll(',', '')
            const indexProduct = orderCreate.order_details.findIndex((e) => e._id === record._id)
            _editProductInOrder('quantity', +value, indexProduct)
          }}
          defaultValue={record.quantity || 1}
          min={1}
          max={record.total_quantity}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          placeholder="Nhập số lượng"
        />
      ),
    },
    {
      title: 'Đơn vị',
      render: (data, record) => (
        <Input
          onBlur={(e) => {
            const value = e.target.value.replaceAll(',', '')
            const indexProduct = orderCreate.order_details.findIndex((e) => e._id === record._id)
            _editProductInOrder('quantity', +value, indexProduct)
          }}
          defaultValue={record.unit || ''}
          style={{ width: 90 }}
          placeholder="Đơn vị"
        />
      ),
    },
    {
      title: 'Đơn giá',
      render: (data, record) => (
        <InputNumber
          style={{ width: 150 }}
          onBlur={(e) => {
            const value = e.target.value.replaceAll(',', '')
            const indexProduct = orderCreate.order_details.findIndex((e) => e._id === record._id)
            _editProductInOrder('price', +value, indexProduct)
          }}
          defaultValue={record.price || 1}
          min={1}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          placeholder="Nhập đơn giá"
        />
      ),
    },
    {
      title: 'Thành tiền',
      render: (data, record) => formatCash(+record.sumCost || 0),
    },
    {
      title: '',
      render: (data, record) => (
        <CloseOutlined
          onClick={() => {
            const indexProduct = orderCreate.order_details.findIndex((e) => e._id === record._id)
            _removeProductToOrder(indexProduct)
          }}
          style={{ fontSize: 12, color: 'red', cursor: 'pointer' }}
        />
      ),
    },
  ]

  const createOrder = async () => {
    // if (voucher) {
    //   try {
    //     const res = await apiCheckPromotion({ voucher })
    //     if (!res.data.success) {
    //       notification.error({
    //         message: 'Voucher không tồn tại hoặc đã được sử dụng',
    //       })
    //       return
    //     }
    //   } catch (e) {
    //     notification.error({
    //       message: 'Voucher không tồn tại hoặc đã được sử dụng',
    //     })
    //     return
    //   }
    // }
    try {
      let totalDiscount =
        (discount.value / 100) *
        orderCreate.order_details.reduce((a, b) => a + b.quantity * b.price, 0)
      const dataList = orderCreate.order_details.map((product) => {
        console.log(product)
        let productDiscount = 0
        if (totalDiscount >= product.price * product.quantity) {
          productDiscount = product.price * product.quantity
          totalDiscount -= product.price * product.quantity
        } else {
          totalDiscount = 0
          productDiscount = totalDiscount
        }
        const data = {
          product_id: product.product_id,
          sku: product.sku,
          variant_id: product.variant_id,
          // supplier: product.suppliers.supplier_id,
          options: product.options,
          // has_variable: product.has_variable,
          price: product.price || 0,
          quantity: product.quantity,
          total_cost: product.price * product.quantity,
          discount: productDiscount,
          final_cost: product.price * product.quantity - productDiscount,
        }

        return voucher
          ? { ...data, voucher: productDiscount ? voucher : ' ' }
          : { ...data, promotion: productDiscount ? promotion : ' ' }
      })

      console.log(dataList)

      const data = {
        sale_location: { branch_id: branchIdApp },
        channel: 'website',
        customer_id: customerInfo.customer_id,
        order_details: dataList,
        payment: '1',
        tax_list: tax,
        voucher: voucher,
        transport: '1',
        total_cost: dataList.reduce((a, b) => a + b.final_cost, 0),
        discount: dataList.reduce((a, b) => a + b.discount, 0),
        final_cost:
          dataList.reduce((a, b) => a + b.total_cost, 0) -
          dataList.reduce((a, b) => a + b.discount, 0),
        // +
        // (dataList.reduce((a, b) => a + b.final_cost, 0) * taxValue) / 100
        latitude: '50.50',
        longtitude: '50.50',
        note: note,
      }
      console.log(data)

      const bodyVoucher = {
        order: CryptoJS.AES.encrypt(
          JSON.stringify({ ...data, voucher }),
          'vierthanhcong'
        ).toString(),
      }
      const bodyPromotion = {
        order: CryptoJS.AES.encrypt(
          JSON.stringify({ ...data, promotion }),
          'vierthanhcong'
        ).toString(),
      }
      console.log('duyyyy')
      const res = voucher
        ? await apiOrderVoucher(bodyVoucher)
        : await apiOrderVoucher(bodyPromotion)
      console.log('duy', bodyVoucher, bodyPromotion)
      console.log(res)
      if (res.data.success) {
        notification.success({ message: 'Tạo hóa đơn thành công' })
        history.push('/order-list')
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getData = async (api, callback) => {
    try {
      const res = await api({ branch_id: branchIdApp })
      console.log(res)
      if (res.status === 200) callback(res.data.data)
    } catch (e) {
      console.log(e)
    }
  }

  const _getCustomers = async () => {
    try {
      setLoadingCustomer(true)
      const res = await getCustomers()
      if (res.status === 200) setCustomers(res.data.data)
      console.log(res)
      setLoadingCustomer(false)
    } catch (error) {
      setLoadingCustomer(false)
      console.log(error)
    }
  }

  const _getBranches = async () => {
    try {
      setLoadingBranch(true)
      const res = await getAllBranch()
      console.log(res)
      if (res.status === 200) setBranches(res.data.data)
      setLoadingBranch(false)
    } catch (error) {
      setLoadingBranch(false)
      console.log(error)
    }
  }

  const _getProductsSearch = async (branch_id = branchActive ? branchActive.branch_id : '') => {
    try {
      setLoadingProduct(true)
      const res = await getProducts({ branch_id, merge: true, detach: true })
      if (res.status === 200) setProductsSearch(res.data.data.map((e) => e.variants))
      setLoadingProduct(false)
    } catch (error) {
      console.log(error)
      setLoadingProduct(false)
    }
  }

  const _getBranchEmployee = () => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      const data = jwt_decode(accessToken)
      if (!infoBranch) {
        if (data.data._branch) {
          localStorage.setItem('branchSell', JSON.stringify(data.data._branch))
          setInfoBranch(data.data._branch)
          _getProductsSearch(data.data._branch.branch_id)
        }
      } else _getProductsSearch(infoBranch.branch_id)
    } else history.push(ROUTES.LOGIN)
  }

  useEffect(() => {
    _getBranchEmployee()
    _getCustomers()
    _getBranches()
    _getProductsSearch()
    _getCustomerAfterEditCustomer()
  }, [])

  useEffect(() => {
    getData(getTaxs, setTaxList)
    getData(getPromotions, setPromotionList)
  }, [branchIdApp])

  return (
    <div className="card">
      <TitlePage
        isAffix
        title={
          <Row align="middle" style={{ cursor: 'pointer' }} onClick={() => history.goBack()}>
            <ArrowLeftOutlined style={{ marginRight: 5 }} />
            Tạo đơn hàng
          </Row>
        }
      >
        <Button onClick={createOrder} size="large" type="primary">
          Tạo đơn và duyệt (F1)
        </Button>
      </TitlePage>
      <Row gutter={30} style={{ marginTop: 20 }}>
        <Col span={16}>
          <div className={styles['block']} style={{ marginBottom: 33 }}>
            <Row justify="space-between" className={styles['title']}>
              <div>Thông tin khách hàng</div>
            </Row>
            <Row justify="space-between" align="middle" wrap={false}>
              <Select
                notFoundContent={loadingCustomer ? <Spin /> : null}
                dropdownClassName="dropdown-select-search-product"
                allowClear
                showSearch
                style={{ width: '100%', marginRight: 20 }}
                placeholder="Tìm kiếm khách hàng"
              >
                {customers.map((customer, index) => (
                  <Select.Option value={customer.first_name + ' ' + customer.last_name} key={index}>
                    <Row
                      style={{ padding: '7px 13px' }}
                      align="middle"
                      justify="space-between"
                      wrap={false}
                      onClick={(e) => {
                        setCustomerInfo(customer)
                        setDeliveryAddress(customer)
                        e.stopPropagation()
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: 0 }}>
                          {customer.first_name + ' ' + customer.last_name}
                        </p>
                        <p style={{ marginBottom: 0 }}>{customer.phone}</p>
                      </div>
                      <CheckOutlined
                        style={{
                          color: 'green',
                          fontSize: 18,
                          display: customerInfo && customerInfo._id === customer._id ? '' : 'none',
                        }}
                      />
                    </Row>
                  </Select.Option>
                ))}
              </Select>

              <Permission permissions={[PERMISSIONS.them_khach_hang]}>
                <ModalCustomerForm>
                  <Tooltip placement="bottom" title="Thêm mới khách hàng">
                    <PlusSquareFilled
                      style={{ fontSize: 34, color: '#0362BA', cursor: 'pointer' }}
                    />
                  </Tooltip>
                </ModalCustomerForm>
              </Permission>
            </Row>

            <Row
              wrap={false}
              align="middle"
              style={{
                display: !customerInfo && 'none',
                marginTop: 15,
              }}
            >
              <UserOutlined style={{ fontSize: 28, marginRight: 15 }} />
              <div style={{ width: '100%' }}>
                <Row wrap={false} align="middle">
                  {customerInfo ? (
                    <Permission permissions={[PERMISSIONS.cap_nhat_khach_hang]}>
                      <ModalCustomerForm>
                        <a style={{ fontWeight: 600, marginRight: 5 }}>
                          {customerInfo && customerInfo.first_name + ' ' + customerInfo.last_name}
                        </a>
                      </ModalCustomerForm>
                    </Permission>
                  ) : (
                    <div></div>
                  )}

                  <span style={{ fontWeight: 500 }}> - {customerInfo && customerInfo.phone}</span>
                </Row>
                <Row wrap={false} justify="space-between" align="middle">
                  <div>
                    <span style={{ fontWeight: 600 }}>Công nợ: </span>
                    <span>{customerInfo && customerInfo.debt}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>Điểm hiện tại: </span>
                    <span>{customerInfo && customerInfo.point}</span>
                  </div>
                </Row>
              </div>

              <CloseCircleTwoTone
                style={{ cursor: 'pointer', marginLeft: 20, fontSize: 23 }}
                onClick={() => {
                  setDeliveryAddress(null)
                  setCustomerInfo(null)
                }}
              />
            </Row>

            <Divider />
            {deliveryAddress && (
              <>
                <Row justify="space-between">
                  <span className={styles['payment-title']}>Địa chỉ giao hàng</span>
                </Row>
                {deliveryAddress && (
                  <div style={{ fontSize: 14.7 }}>
                    <div>
                      {`${deliveryAddress.first_name} ${deliveryAddress.last_name}`} -{' '}
                      {deliveryAddress.phone}
                    </div>
                    <div>
                      {`${deliveryAddress.address}, ${deliveryAddress.district}, ${deliveryAddress.province}`}
                    </div>
                  </div>
                )}
                <ChangeDelivery address={deliveryAddress} setDeliveryAddress={setDeliveryAddress} />
              </>
            )}
          </div>

          <div className={styles['block']}>
            <div className={styles['title']}>Sản phẩm</div>
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
                      <a rel="noreferrer" href={ROUTES.PRODUCT_ADD} target="_blank">
                        <Row wrap={false} align="middle" style={{ color: 'black' }}>
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
                      </a>
                    </Permission>
                    {menu}
                  </div>
                )}
              >
                {productsSearch.length ? (
                  productsSearch.map((data) => (
                    <Select.Option value={data.title} key={data.title}>
                      <Row
                        align="middle"
                        wrap={false}
                        style={{ padding: '7px 13px' }}
                        onClick={(e) => {
                          _addProductToOrder(data)
                          e.stopPropagation()
                          setProductData([...productData, data])
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
                          <Row wrap={false} justify="space-between">
                            <p style={{ marginBottom: 0, color: 'gray' }}>{data.sku}</p>
                            <p style={{ marginBottom: 0, color: 'gray' }}>
                              Có thể bán: {formatCash(data.total_quantity)}
                            </p>
                          </Row>
                        </div>
                      </Row>
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option style={{ display: 'none' }}></Select.Option>
                )}
              </Select>
            </div>

            <Table
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
                        <div>VAT</div>
                        <div>{formatCash(orderCreate.VAT || 0)}</div>
                      </Row>
                      <Row wrap={false} justify="space-between">
                        <div>Chiết khấu</div>
                        <div>
                          {formatCash(orderCreate.discount ? orderCreate.discount.value : 0)}{' '}
                          {orderCreate.discount
                            ? orderCreate.discount.type === 'VALUE'
                              ? ''
                              : '%'
                            : ''}
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
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            defaultValue={orderCreate.deliveryCharges}
                          />
                        </div>
                      </Row>
                      <Row wrap={false} justify="space-between" style={{ fontWeight: 600 }}>
                        <div>Khách phải trả</div>
                        <div>{formatCash(+orderCreate.moneyToBePaidByCustomer || 0)}</div>
                      </Row>
                    </div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>
          <div className={styles['block']} style={{ marginTop: 30 }}>
            <Row wrap={false} align="middle" style={{ fontWeight: 600 }}>
              <CreditCardFilled style={{ fontSize: 17 }} />
              <div style={{ margin: '0px 5px' }}>XÁC NHẬN THANH TOÁN</div>
              <Tooltip
                title={
                  <div style={{ textAlign: 'center' }}>
                    Xác nhận đơn hàng đã được thanh toán thành công hoặc chọn thanh toán sau với
                    hình thức thanh toán dự kiến. Bạn có thể bỏ qua bước này nếu khách hàng chưa sẵn
                    sàng thanh toán
                  </div>
                }
              >
                <InfoCircleTwoTone style={{ fontSize: 12 }} />
              </Tooltip>
            </Row>
            <div style={{ marginTop: 10 }}>
              <Radio.Group
                onChange={(e) => _editOrder('type_payment', e.target.value)}
                defaultValue={orderCreate.type_payment}
              >
                <Space size="small" direction="vertical">
                  <Radio value="Thanh toán trước">Khách hàng thanh toán trước</Radio>
                  <Radio value="Thu cod">Thu COD sau khi giao hàng thành công</Radio>
                  <Radio value="Thanh toán sau">Thanh toán sau</Radio>
                </Space>
              </Radio.Group>
            </div>
            <Divider />

            {orderCreate.type_payment === 'Thanh toán trước' && (
              <div>
                <Row justify="space-between" wrap={false}>
                  <div style={{ width: '45%' }}>
                    <div>Hình thức thanh toán</div>
                    <Select
                      defaultValue="Quẹt thẻ"
                      placeholder="Chọn hình thức thanh toán"
                      style={{ width: '100%' }}
                    >
                      <Select.Option value="Quẹt thẻ">Quẹt thẻ</Select.Option>
                      <Select.Option value="Chuyển khoản">Chuyển khoản</Select.Option>
                      <Select.Option value="Tiền mặt">Tiền mặt</Select.Option>
                    </Select>
                  </div>
                  <div style={{ width: '45%' }}>
                    <div>Số tiền thanh toán</div>
                    <InputNumber
                      defaultValue={orderCreate.moneyToBePaidByCustomer}
                      style={{ width: '100%' }}
                      min={0}
                      max={orderCreate.moneyToBePaidByCustomer}
                      placeholder="Nhập số tiền thanh toán"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </div>
                </Row>
                <Row justify="space-between" wrap={false} style={{ marginTop: 15 }}>
                  <div style={{ width: '45%' }}>
                    <div>Ngày thanh toán</div>
                    <DatePicker
                      defaultValue={moment(new Date(), 'DD/MM/YYYY HH:mm:ss')}
                      format="DD/MM/YYYY HH:mm:ss"
                      showTime={{ defaultValue: moment(new Date(), 'HH:mm:ss') }}
                      style={{ width: '100%' }}
                      placeholder="Chọn ngày thanh toán"
                    />
                  </div>
                  <div style={{ width: '45%' }}>
                    <div>Tham chiếu</div>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={orderCreate.moneyToBePaidByCustomer}
                      placeholder="Nhập tham chiếu"
                    />
                  </div>
                </Row>
              </div>
            )}
            {orderCreate.type_payment === 'Thanh toán sau' && (
              <div>
                <Row justify="space-between" wrap={false}>
                  <div style={{ width: '45%' }}>
                    <div>Hình thức thanh toán dự kiến</div>
                    <Select
                      defaultValue="Tiền mặt"
                      placeholder="Chọn hình thức thanh toán"
                      style={{ width: '100%' }}
                    >
                      <Select.Option value="Quẹt thẻ">Quẹt thẻ</Select.Option>
                      <Select.Option value="Thanh toán bằng điểm">
                        Thanh toán bằng điểm
                      </Select.Option>
                      <Select.Option value="Chuyển khoản">Chuyển khoản</Select.Option>
                      <Select.Option value="Tiền mặt">Tiền mặt</Select.Option>
                    </Select>
                  </div>
                </Row>
              </div>
            )}

            {orderCreate.type_payment === 'Thu cod' && (
              <div>
                <div>
                  Số tiền cần người mua thanh toán bạn vui lòng nhập ở phần <b>"Tiền thu hộ"</b>{' '}
                  trong thông tin giao hàng. Bạn có thể lựa chọn <b>"Đẩy đơn qua ĐTVC"</b> hoặc{' '}
                  <b>"Tự gọi shipper"</b>
                  để hoàn thành đơn. Trường hợp chọn <b>"Giao hàng sau"</b>, COD sẽ được ghi nhận
                  thành hình thức thanh toán dự kiến.
                </div>
              </div>
            )}
          </div>

          <div className={styles['block']} style={{ marginTop: 30 }}>
            <Row wrap={false} align="middle" style={{ fontWeight: 600 }}>
              <CarFilled style={{ fontSize: 17 }} />
              <div style={{ margin: '0px 5px' }}>ĐÓNG GÓI VÀ GIAO HÀNG</div>
              <Tooltip
                title={
                  <div style={{ textAlign: 'center' }}>
                    Xác nhận đơn hàng đã được đóng gói và chuyển sang đơn vị vận chuyển . Bạn có thể
                    bỏ qua bước này nếu chưa sẵn sàng đóng gói và giao hàng
                  </div>
                }
              >
                <InfoCircleTwoTone style={{ fontSize: 12 }} />
              </Tooltip>
            </Row>
            <div style={{ marginTop: 10 }}>
              <Tabs type="card">
                <Tabs.TabPane
                  tab={
                    <span>
                      <CarOutlined style={{ marginRight: 3 }} /> Đẩy qua hãng vận chuyển
                    </span>
                  }
                  key="1"
                >
                  Dịch vụ vận chuyển dành cho các đối tác vận chuyển.
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      <UserOutlined style={{ marginRight: 3 }} /> Tự gọi shipper
                    </span>
                  }
                  key="2"
                >
                  Dịch vụ vận chuyển dành cho các đối tác vận chuyển là nhân viên chi nhánh hoặc
                  thuê ở bên ngoài.
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      <ShopOutlined style={{ marginRight: 3 }} /> Nhận tại chi nhánh
                    </span>
                  }
                  key="3"
                >
                  Chọn nhận tại chi nhánh khi khách hàng xác nhận sẽ qua tận nơi để lấy sản phẩm.
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      <ClockCircleOutlined style={{ marginRight: 3 }} /> Giao hàng sau
                    </span>
                  }
                  key="4"
                >
                  Bạn có thể xử lý giao hàng sau khi tạo và duyệt đơn hàng.
                </Tabs.TabPane>
              </Tabs>
            </div>
          </div>
        </Col>

        <Col span={8}>
          <div className={styles['block']} style={{ marginBottom: 30 }}>
            <div className={styles['title']}>Chi nhánh</div>
            <Select
              placeholder="Chọn chi nhánh"
              showSearch
              defaultValue={branchActive && branchActive.branch_id}
              notFoundContent={loadingBranch ? <Spin /> : null}
              style={{ width: '100%' }}
            >
              {branches.map((e, index) => (
                <Select.Option value={e.branch_id} key={index}>
                  {e.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Form layout="vertical" form={formInfoOrder}>
            <div className={styles['block']} style={{ marginBottom: 30 }}>
              <div className={styles['title']}>Thông tin đơn hàng</div>

              <Form.Item label="Mã đơn hàng" name="order_id">
                <Input placeholder="Nhập mã đơn hàng" />
              </Form.Item>
            </div>

            <div className={styles['block']} style={{ marginBottom: 30 }}>
              <ModalPromotion order={orderCreate} editOrder={_editOrder} />
            </div>

            <div className={styles['block']}>
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
          </Form>
        </Col>
      </Row>
    </div>
  )
}
