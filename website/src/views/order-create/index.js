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
    name: '????n 1',
    type: 'default',
    customer: null,
    order_details: [], //danh s??ch s???n ph???m trong h??a ????n
    payments: [], //h??nh th???c thanh to??n
    type_payment: 'Thanh to??n sau', //h??nh th???c thanh to??n
    sumCostPaid: 0, // t???ng ti???n c???a t???t c??? s???n ph???m
    discount: null,
    VAT: 0,
    noteInvoice: '',
    salesChannel: '', //k??nh b??n h??ng
    isDelivery: true, //m???c ?????nh l?? h??a ????n giao h??ng
    deliveryCharges: 0, //ph?? giao h??ng
    deliveryAddress: null, //?????a ch??? nh???n h??ng
    shipping: null, //????n v??? v???n chuy???n
    billOfLadingCode: '',
    moneyToBePaidByCustomer: 0, // t???ng ti???n kh??ch h??ng ph???i tr???
    prepay: 0, //ti???n kh??ch thanh to??n tr?????c
    moneyGivenByCustomer: 0, //ti???n kh??ch h??ng ????a
    excessCash: 0, //ti???n th???a
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

    //t???ng ti???n kh??ch h??ng ph???i tr???
    orderCreateNew.moneyToBePaidByCustomer =
      orderCreateNew.sumCostPaid +
      orderCreateNew.VAT +
      (orderCreateNew.isDelivery ? orderCreateNew.deliveryCharges : 0)

    //discount c?? 2 lo???i
    //n???u type = value th?? c???ng
    // n???u type = percent th?? nh??n
    if (orderCreateNew.discount) {
      if (orderCreateNew.discount.type === 'VALUE')
        orderCreateNew.moneyToBePaidByCustomer -= +orderCreateNew.discount.value
      else
        orderCreateNew.moneyToBePaidByCustomer -=
          (+orderCreateNew.discount.value / 100) * orderCreateNew.moneyToBePaidByCustomer
    }

    //ti???n th???a
    const excessCashNew =
      (orderCreateNew.isDelivery ? orderCreateNew.prepay : orderCreateNew.moneyGivenByCustomer) -
      orderCreateNew.moneyToBePaidByCustomer

    orderCreateNew.excessCash = excessCashNew >= 0 ? excessCashNew : 0

    setOrderCreate({ ...orderCreateNew })
  }

  const _addProductToOrder = (product) => {
    if (product) {
      //check product c?? ????? s??? l?????ng
      if (product.total_quantity !== 0) {
        const orderCreateNew = { ...orderCreate }
        const indexProduct = orderCreateNew.order_details.findIndex((e) => e._id === product._id)

        //n???u ???? c?? s???n trong cart r???i th?? t??ng s??? l?????ng v?? t???ng ti???n c???a s???n ph???m ???? l??n
        //n???u ch??a c?? th?? push v??o gi??? h??ng
        if (indexProduct !== -1) {
          if (orderCreateNew.order_details[indexProduct].quantity < product.total_quantity) {
            orderCreateNew.order_details[indexProduct].quantity++

            orderCreateNew.order_details[indexProduct].sumCost =
              +orderCreateNew.order_details[indexProduct].quantity *
              +orderCreateNew.order_details[indexProduct].price

            //thu??? VAT c???a m???i s???n ph???m
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
              message: 'S???n ph???m kh??ng ????? s??? l?????ng ????? b??n, vui l??ng ch???n s???n ph???m kh??c!',
            })
        } else
          orderCreateNew.order_details.push({
            ...product,
            unit: '', //????n v???
            quantity: 1, //s??? l?????ng s???n ph???m
            sumCost: product.price, // t???ng gi?? ti???n
            VAT_Product:
              product._taxes && product._taxes.length
                ? (
                    (product._taxes.reduce((total, current) => total + current.value, 0) / 100) *
                    product.price
                  ).toFixed(0)
                : 0,
          })

        // t???ng ti???n c???a t???t c??? s???n ph???m
        orderCreateNew.sumCostPaid = orderCreateNew.order_details.reduce(
          (total, current) => total + current.sumCost,
          0
        )

        //t???ng thu??? VAT c???a t???t c??? s???n ph???m
        orderCreateNew.VAT = orderCreateNew.order_details.reduce(
          (total, current) => total + +current.VAT_Product,
          0
        )

        //t???ng ti???n kh??ch h??ng ph???i tr???
        orderCreateNew.moneyToBePaidByCustomer =
          orderCreateNew.sumCostPaid +
          orderCreateNew.VAT +
          (orderCreateNew.isDelivery ? orderCreateNew.deliveryCharges : 0)

        //discount c?? 2 lo???i
        //n???u type = value th?? c???ng
        // n???u type = percent th?? nh??n
        if (orderCreateNew.discount) {
          if (orderCreateNew.discount.type === 'VALUE')
            orderCreateNew.moneyToBePaidByCustomer -= +orderCreateNew.discount.value
          else
            orderCreateNew.moneyToBePaidByCustomer -=
              (+orderCreateNew.discount.value / 100) * orderCreateNew.moneyToBePaidByCustomer
        }

        //ti???n th???a
        const excessCashNew =
          (orderCreateNew.isDelivery
            ? orderCreateNew.prepay
            : orderCreateNew.moneyGivenByCustomer) - orderCreateNew.moneyToBePaidByCustomer

        orderCreateNew.excessCash = excessCashNew >= 0 ? excessCashNew : 0

        setOrderCreate({ ...orderCreateNew })
      } else
        notification.warning({
          message: 'S???n ph???m kh??ng ????? s??? l?????ng ????? b??n, vui l??ng ch???n s???n ph???m kh??c!',
        })
    }
  }

  const _editProductInOrder = (attribute, value, index) => {
    if (index !== -1) {
      const orderCreateNew = { ...orderCreate }
      orderCreateNew.order_details[index][attribute] = value

      //t???ng ti???n c???a 1 s???n ph???m
      orderCreateNew.order_details[index].sumCost =
        +orderCreateNew.order_details[index].quantity * +orderCreateNew.order_details[index].price

      //thu??? VAT c???a m???i s???n ph???m
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

      //t???ng thu??? VAT c???a t???t c??? c??c s???n ph???m
      orderCreateNew.VAT = orderCreateNew.order_details.reduce(
        (total, current) => total + +current.VAT_Product,
        0
      )

      // t???ng ti???n c???a t???t c??? s???n ph???m
      orderCreateNew.sumCostPaid = orderCreateNew.order_details.reduce(
        (total, current) => total + current.sumCost,
        0
      )

      //t???ng ti???n kh??ch h??ng ph???i tr???
      orderCreateNew.moneyToBePaidByCustomer =
        orderCreateNew.sumCostPaid +
        orderCreateNew.VAT +
        (orderCreateNew.isDelivery ? orderCreateNew.deliveryCharges : 0)

      //discount c?? 2 lo???i
      //n???u type = value th?? c???ng
      // n???u type = percent th?? nh??n
      if (orderCreateNew.discount) {
        if (orderCreateNew.discount.type === 'VALUE')
          orderCreateNew.moneyToBePaidByCustomer -= +orderCreateNew.discount.value
        else
          orderCreateNew.moneyToBePaidByCustomer -=
            (+orderCreateNew.discount.value / 100) * orderCreateNew.moneyToBePaidByCustomer
      }

      //ti???n th???a
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

      //t???ng thu??? VAT c???a t???t c??? c??c s???n ph???m
      orderCreateNew.VAT = orderCreateNew.order_details.reduce(
        (total, current) => total + +current.VAT_Product,
        0
      )

      // t???ng ti???n c???a t???t c??? s???n ph???m
      orderCreateNew.sumCostPaid = orderCreateNew.order_details.reduce(
        (total, current) => total + current.sumCost,
        0
      )

      //t???ng ti???n kh??ch h??ng ph???i tr???
      orderCreateNew.moneyToBePaidByCustomer =
        orderCreateNew.sumCostPaid +
        orderCreateNew.VAT +
        (orderCreateNew.isDelivery ? orderCreateNew.deliveryCharges : 0)

      //discount c?? 2 lo???i
      //n???u type = value th?? c???ng
      // n???u type = percent th?? nh??n
      if (orderCreateNew.discount) {
        if (orderCreateNew.discount.type === 'VALUE')
          orderCreateNew.moneyToBePaidByCustomer -= +orderCreateNew.discount.value
        else
          orderCreateNew.moneyToBePaidByCustomer -=
            (+orderCreateNew.discount.value / 100) * orderCreateNew.moneyToBePaidByCustomer
      }

      //ti???n th???a
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
          title={`${record ? 'C???p nh???t' : 'T???o'} kh??ch h??ng`}
          visible={visible}
        >
          <CustomerForm
            record={record}
            close={toggle}
            text={record ? 'L??u' : 'T???o'}
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
      title: 'M?? SKU',
      dataIndex: 'sku',
    },
    {
      title: 'S???n ph???m',
      dataIndex: 'title',
    },
    {
      title: 'S??? l?????ng',
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
          placeholder="Nh???p s??? l?????ng"
        />
      ),
    },
    {
      title: '????n v???',
      render: (data, record) => (
        <Input
          onBlur={(e) => {
            const value = e.target.value.replaceAll(',', '')
            const indexProduct = orderCreate.order_details.findIndex((e) => e._id === record._id)
            _editProductInOrder('quantity', +value, indexProduct)
          }}
          defaultValue={record.unit || ''}
          style={{ width: 90 }}
          placeholder="????n v???"
        />
      ),
    },
    {
      title: '????n gi??',
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
          placeholder="Nh???p ????n gi??"
        />
      ),
    },
    {
      title: 'Th??nh ti???n',
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
    //         message: 'Voucher kh??ng t???n t???i ho???c ???? ???????c s??? d???ng',
    //       })
    //       return
    //     }
    //   } catch (e) {
    //     notification.error({
    //       message: 'Voucher kh??ng t???n t???i ho???c ???? ???????c s??? d???ng',
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
        notification.success({ message: 'T???o h??a ????n th??nh c??ng' })
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
            T???o ????n h??ng
          </Row>
        }
      >
        <Button onClick={createOrder} size="large" type="primary">
          T???o ????n v?? duy???t (F1)
        </Button>
      </TitlePage>
      <Row gutter={30} style={{ marginTop: 20 }}>
        <Col span={16}>
          <div className={styles['block']} style={{ marginBottom: 33 }}>
            <Row justify="space-between" className={styles['title']}>
              <div>Th??ng tin kh??ch h??ng</div>
            </Row>
            <Row justify="space-between" align="middle" wrap={false}>
              <Select
                notFoundContent={loadingCustomer ? <Spin /> : null}
                dropdownClassName="dropdown-select-search-product"
                allowClear
                showSearch
                style={{ width: '100%', marginRight: 20 }}
                placeholder="T??m ki???m kh??ch h??ng"
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
                  <Tooltip placement="bottom" title="Th??m m???i kh??ch h??ng">
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
                    <span style={{ fontWeight: 600 }}>C??ng n???: </span>
                    <span>{customerInfo && customerInfo.debt}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>??i???m hi???n t???i: </span>
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
                  <span className={styles['payment-title']}>?????a ch??? giao h??ng</span>
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
            <div className={styles['title']}>S???n ph???m</div>
            <div className="select-product-sell">
              <Select
                notFoundContent={loadingProduct ? <Spin size="small" /> : null}
                dropdownClassName="dropdown-select-search-product"
                allowClear
                showSearch
                clearIcon={<CloseOutlined style={{ color: 'black' }} />}
                suffixIcon={<SearchOutlined style={{ color: 'black', fontSize: 15 }} />}
                style={{ width: '100%', marginBottom: 15 }}
                placeholder="Th??m s???n ph???m v??o ho?? ????n"
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
                            Th??m s???n ph???m m???i
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
                              C?? th??? b??n: {formatCash(data.total_quantity)}
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
                      ????n h??ng c???a b???n ch??a c?? s???n ph???m
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
                        <div>T???ng ti???n ({orderCreate.order_details.length} s???n ph???m)</div>
                        <div>
                          {orderCreate.sumCostPaid ? formatCash(+orderCreate.sumCostPaid) : 0}
                        </div>
                      </Row>
                      <Row wrap={false} justify="space-between">
                        <div>VAT</div>
                        <div>{formatCash(orderCreate.VAT || 0)}</div>
                      </Row>
                      <Row wrap={false} justify="space-between">
                        <div>Chi???t kh???u</div>
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
                        <div>Ph?? giao h??ng</div>
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
                        <div>Kh??ch ph???i tr???</div>
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
              <div style={{ margin: '0px 5px' }}>X??C NH???N THANH TO??N</div>
              <Tooltip
                title={
                  <div style={{ textAlign: 'center' }}>
                    X??c nh???n ????n h??ng ???? ???????c thanh to??n th??nh c??ng ho???c ch???n thanh to??n sau v???i
                    h??nh th???c thanh to??n d??? ki???n. B???n c?? th??? b??? qua b?????c n??y n???u kh??ch h??ng ch??a s???n
                    s??ng thanh to??n
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
                  <Radio value="Thanh to??n tr?????c">Kh??ch h??ng thanh to??n tr?????c</Radio>
                  <Radio value="Thu cod">Thu COD sau khi giao h??ng th??nh c??ng</Radio>
                  <Radio value="Thanh to??n sau">Thanh to??n sau</Radio>
                </Space>
              </Radio.Group>
            </div>
            <Divider />

            {orderCreate.type_payment === 'Thanh to??n tr?????c' && (
              <div>
                <Row justify="space-between" wrap={false}>
                  <div style={{ width: '45%' }}>
                    <div>H??nh th???c thanh to??n</div>
                    <Select
                      defaultValue="Qu???t th???"
                      placeholder="Ch???n h??nh th???c thanh to??n"
                      style={{ width: '100%' }}
                    >
                      <Select.Option value="Qu???t th???">Qu???t th???</Select.Option>
                      <Select.Option value="Chuy???n kho???n">Chuy???n kho???n</Select.Option>
                      <Select.Option value="Ti???n m???t">Ti???n m???t</Select.Option>
                    </Select>
                  </div>
                  <div style={{ width: '45%' }}>
                    <div>S??? ti???n thanh to??n</div>
                    <InputNumber
                      defaultValue={orderCreate.moneyToBePaidByCustomer}
                      style={{ width: '100%' }}
                      min={0}
                      max={orderCreate.moneyToBePaidByCustomer}
                      placeholder="Nh???p s??? ti???n thanh to??n"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </div>
                </Row>
                <Row justify="space-between" wrap={false} style={{ marginTop: 15 }}>
                  <div style={{ width: '45%' }}>
                    <div>Ng??y thanh to??n</div>
                    <DatePicker
                      defaultValue={moment(new Date(), 'DD/MM/YYYY HH:mm:ss')}
                      format="DD/MM/YYYY HH:mm:ss"
                      showTime={{ defaultValue: moment(new Date(), 'HH:mm:ss') }}
                      style={{ width: '100%' }}
                      placeholder="Ch???n ng??y thanh to??n"
                    />
                  </div>
                  <div style={{ width: '45%' }}>
                    <div>Tham chi???u</div>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={orderCreate.moneyToBePaidByCustomer}
                      placeholder="Nh???p tham chi???u"
                    />
                  </div>
                </Row>
              </div>
            )}
            {orderCreate.type_payment === 'Thanh to??n sau' && (
              <div>
                <Row justify="space-between" wrap={false}>
                  <div style={{ width: '45%' }}>
                    <div>H??nh th???c thanh to??n d??? ki???n</div>
                    <Select
                      defaultValue="Ti???n m???t"
                      placeholder="Ch???n h??nh th???c thanh to??n"
                      style={{ width: '100%' }}
                    >
                      <Select.Option value="Qu???t th???">Qu???t th???</Select.Option>
                      <Select.Option value="Thanh to??n b???ng ??i???m">
                        Thanh to??n b???ng ??i???m
                      </Select.Option>
                      <Select.Option value="Chuy???n kho???n">Chuy???n kho???n</Select.Option>
                      <Select.Option value="Ti???n m???t">Ti???n m???t</Select.Option>
                    </Select>
                  </div>
                </Row>
              </div>
            )}

            {orderCreate.type_payment === 'Thu cod' && (
              <div>
                <div>
                  S??? ti???n c???n ng?????i mua thanh to??n b???n vui l??ng nh???p ??? ph???n <b>"Ti???n thu h???"</b>{' '}
                  trong th??ng tin giao h??ng. B???n c?? th??? l???a ch???n <b>"?????y ????n qua ??TVC"</b> ho???c{' '}
                  <b>"T??? g???i shipper"</b>
                  ????? ho??n th??nh ????n. Tr?????ng h???p ch???n <b>"Giao h??ng sau"</b>, COD s??? ???????c ghi nh???n
                  th??nh h??nh th???c thanh to??n d??? ki???n.
                </div>
              </div>
            )}
          </div>

          <div className={styles['block']} style={{ marginTop: 30 }}>
            <Row wrap={false} align="middle" style={{ fontWeight: 600 }}>
              <CarFilled style={{ fontSize: 17 }} />
              <div style={{ margin: '0px 5px' }}>????NG G??I V?? GIAO H??NG</div>
              <Tooltip
                title={
                  <div style={{ textAlign: 'center' }}>
                    X??c nh???n ????n h??ng ???? ???????c ????ng g??i v?? chuy???n sang ????n v??? v???n chuy???n . B???n c?? th???
                    b??? qua b?????c n??y n???u ch??a s???n s??ng ????ng g??i v?? giao h??ng
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
                      <CarOutlined style={{ marginRight: 3 }} /> ?????y qua h??ng v???n chuy???n
                    </span>
                  }
                  key="1"
                >
                  D???ch v??? v???n chuy???n d??nh cho c??c ?????i t??c v???n chuy???n.
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      <UserOutlined style={{ marginRight: 3 }} /> T??? g???i shipper
                    </span>
                  }
                  key="2"
                >
                  D???ch v??? v???n chuy???n d??nh cho c??c ?????i t??c v???n chuy???n l?? nh??n vi??n chi nh??nh ho???c
                  thu?? ??? b??n ngo??i.
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      <ShopOutlined style={{ marginRight: 3 }} /> Nh???n t???i chi nh??nh
                    </span>
                  }
                  key="3"
                >
                  Ch???n nh???n t???i chi nh??nh khi kh??ch h??ng x??c nh???n s??? qua t???n n??i ????? l???y s???n ph???m.
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      <ClockCircleOutlined style={{ marginRight: 3 }} /> Giao h??ng sau
                    </span>
                  }
                  key="4"
                >
                  B???n c?? th??? x??? l?? giao h??ng sau khi t???o v?? duy???t ????n h??ng.
                </Tabs.TabPane>
              </Tabs>
            </div>
          </div>
        </Col>

        <Col span={8}>
          <div className={styles['block']} style={{ marginBottom: 30 }}>
            <div className={styles['title']}>Chi nh??nh</div>
            <Select
              placeholder="Ch???n chi nh??nh"
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
              <div className={styles['title']}>Th??ng tin ????n h??ng</div>

              <Form.Item label="M?? ????n h??ng" name="order_id">
                <Input placeholder="Nh???p m?? ????n h??ng" />
              </Form.Item>
            </div>

            <div className={styles['block']} style={{ marginBottom: 30 }}>
              <ModalPromotion order={orderCreate} editOrder={_editOrder} />
            </div>

            <div className={styles['block']}>
              <div className={styles['title']}>
                Ghi ch??{' '}
                <Tooltip
                  title={
                    <div style={{ textAlign: 'center' }}>
                      Th??m th??ng tin ghi ch?? ph???c v??? cho vi???c xem th??ng tin v?? x??? l?? ????n h??ng. (VD:
                      ????n giao trong ng??y, giao trong gi??? h??nh ch??nh...)
                    </div>
                  }
                >
                  <InfoCircleTwoTone style={{ fontSize: 12 }} />
                </Tooltip>
              </div>
              <Form.Item name="note">
                <Input.TextArea rows={2} placeholder="Nh???p ghi ch??" />
              </Form.Item>

              <div className={styles['title']}>
                Tag{' '}
                <Tooltip
                  title={
                    <div style={{ textAlign: 'center' }}>
                      Ch???n ho???c th??m c??c th??? cho ????n h??ng, th??? n??y ph???c v??? cho vi???c l???c c??c ????n (VD:
                      ????n giao g???p, ????n n???i th??nh...)
                    </div>
                  }
                >
                  <InfoCircleTwoTone style={{ fontSize: 12 }} />
                </Tooltip>
              </div>
              <Form.Item name="tags">
                <Select mode="tags" placeholder="Nh???p tags"></Select>
              </Form.Item>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  )
}
