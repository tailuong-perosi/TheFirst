import React, { useState, useEffect, useRef } from 'react'
import styles from './sell.module.scss'
import { v4 as uuidv4 } from 'uuid'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { formatCash, encryptText } from 'utils'
import { ACTION, IMAGE_DEFAULT, PERMISSIONS, ROUTES, SHIP_STATUS_ORDER } from 'consts'
import noData from 'assets/icons/no-data.png'
import KeyboardEventHandler from 'react-keyboard-event-handler'
import ReactToPrint, { useReactToPrint } from 'react-to-print'

//components
import CustomerForm from 'views/customer/customer-form'
import FilterProductsByCategory from './filter-by-category'
import FilterProductsBySku from './filter-by-sku'
import ModalKeyboardShortCuts from './keyboard-shortcuts'
import ModalPromotion from './promotion-available'
import Permission from 'components/permission'
import PaymentMethods from './payment-methods'
import ModalOrdersReturn from './orders-returns'
import ModalChangeBranch from './change-branch'
import ModalDeliveryAddress from './delivery-address'
import ModalInfoSeller from './info-seller'
import HeaderGroupButton from './header-group-button'
import PrintOrder from 'components/print/print-order'
import ScanProduct from './scan-product'

//antd
import {
  Row,
  Select,
  Tabs,
  Popconfirm,
  Space,
  Tooltip,
  Modal,
  Button,
  Divider,
  Switch,
  Radio,
  Input,
  InputNumber,
  Table,
  Pagination,
  Popover,
  Spin,
  Tag,
  notification,
  Col,
  Checkbox,
} from 'antd'

//icons antd
import {
  SearchOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  CloseCircleTwoTone,
  MoreOutlined,
  UserOutlined,
  CloseOutlined,
  PlusSquareOutlined,
  PlusSquareFilled,
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
} from '@ant-design/icons'

//apis
import { getCustomers } from 'apis/customer'
import { getShippings } from 'apis/shipping'
import { getProducts } from 'apis/product'
import { addOrder } from 'apis/order'
import { getAllBranch } from 'apis/branch'
import { getPayments } from 'apis/payment'

export default function Sell() {
  const history = useHistory()
  const dispatch = useDispatch()
  const dataUser = useSelector((state) => state.login.dataUser)
  const invoicesSelector = useSelector((state) => state.invoice.invoices)
  const branchIdApp = useSelector((state) => state.branch.branchId)
  const printOrderRef = useRef()

  //list ref keyboard
  const inputRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => printOrderRef.current,
  })

  const [loadingBranch, setLoadingBranch] = useState(false)
  const [branches, setBranches] = useState([])

  const [chooseButtonPrice, setChooseButtonPrice] = useState('')

  const [visibleConfirmCreateOrder, setVisibleConfirmCreateOrder] = useState(false)

  const [shippingsMethod, setShippingsMethod] = useState([])
  const [visibleCustomerUpdate, setVisibleCustomerUpdate] = useState(false)

  const [productsAllBranch, setProductsAllBranch] = useState([])
  const [productsSearch, setProductsSearch] = useState([])
  const [productsRelated, setProductsRelated] = useState([])
  const [countProducts, setCountProducts] = useState(0)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [loadingProductRelated, setLoadingProductRelated] = useState(false)
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 10 })

  const [paymentMethodDefault, setPaymentMethodDefault] = useState({})
  const [visiblePayments, setVisiblePayments] = useState(false)
  const [visibleCreateCustomer, setVisibleCreateCustomer] = useState(false)
  const toggleCustomer = () => setVisibleCreateCustomer(!visibleCreateCustomer)
  const [visibleUpdateCustomer, setVisibleUpdateCustomer] = useState(false)
  const toggleUpdateCustomer = () => setVisibleUpdateCustomer(!visibleUpdateCustomer)
  const [loadingCustomer, setLoadingCustomer] = useState(false)
  const [customers, setCustomers] = useState([])

  const [infoBranch, setInfoBranch] = useState({})

  //object invoice
  const initInvoice = {
    id: uuidv4(),
    name: '000001',
    type: 'default',
    customer: null,
    order_details: [], //danh s??ch s???n ph???m trong h??a ????n
    payments: [{ ...paymentMethodDefault }], //h??nh th???c thanh to??n
    sumCostPaid: 0, // t???ng ti???n c???a t???t c??? s???n ph???m
    discount: null,
    VAT: 0,
    noteInvoice: '',
    salesChannel: '', //k??nh b??n h??ng
    isDelivery: false,
    deliveryCharges: 0, //ph?? giao h??ng
    deliveryAddress: null, //?????a ch??? nh???n h??ng
    shipping: null, //????n v??? v???n chuy???n
    billOfLadingCode: '',
    moneyToBePaidByCustomer: 0, // t???ng ti???n kh??ch h??ng ph???i tr???
    prepay: 0, //ti???n kh??ch thanh to??n m???t ph???n
    moneyGivenByCustomer: 0, //ti???n kh??ch h??ng ????a
    excessCash: 0, //ti???n th???a
    create_date: new Date(), //ng??y t???o ????n h??ng
    code: '', //m?? ????n h??ng khi in h??a ????n
  }
  const [invoices, setInvoices] = useState(
    !invoicesSelector.length ? [initInvoice] : invoicesSelector
  )
  const [indexInvoice, setIndexInvoice] = useState(0)
  const [activeKeyTab, setActiveKeyTab] = useState(initInvoice.id)

  const _deleteInvoiceAfterCreateOrder = () => {
    const invoicesNew = [...invoices]
    invoicesNew.splice(indexInvoice, 1)

    if (invoicesNew.length === 0) {
      initInvoice.name = `00000${invoicesNew.length + 1}`
      invoicesNew.push(initInvoice)
      setActiveKeyTab(initInvoice.id)
    } else setActiveKeyTab(invoicesNew[0].id)

    setIndexInvoice(0)
    setInvoices([...invoicesNew])
  }

  const _createInvoice = () => {
    if (invoices.length > 9) {
      notification.warning({ message: 'T???i ??a ch??? t???o ???????c 10 ????n h??ng' })
      return
    }

    const invoicesNew = [...invoices]
    initInvoice.name = `0000${invoicesNew.length + 1}`
    invoicesNew.push(initInvoice)

    setInvoices([...invoicesNew])
    setActiveKeyTab(initInvoice.id)
    const iVoice = invoicesNew.findIndex((e) => e.id === initInvoice.id)
    if (iVoice !== -1) setIndexInvoice(iVoice)
  }

  const _deleteInvoice = (invoice, index) => {
    const invoicesNew = [...invoices]
    invoicesNew.splice(index, 1)

    if (activeKeyTab === invoice.id) {
      setIndexInvoice(0)
      setActiveKeyTab(invoicesNew[0].id)
    } else {
      const indexInvoice = invoicesNew.findIndex((e) => e.id === activeKeyTab)
      if (indexInvoice !== -1) setIndexInvoice(indexInvoice)
    }

    setInvoices([...invoicesNew])
  }

  const _addProductToCartInvoice = (product) => {
    const keyNoti = 'product'
    const ButtonsBottom = () => (
      <Row>
        <Col span={8}>
          <ModalQuantityProductInStores btn="Xem s???n ph???m ??? chi nh??nh kh??c" product={product} />
        </Col>
        <Col span={8} offset={7}>
          <Button
            type="primary"
            onClick={() => {
              _addProductToCartInvoice({ ...product, total_quantity: 1000 })
              notification.close(keyNoti)
            }}
          >
            B??n h??ng pre-order
          </Button>
        </Col>
      </Row>
    )

    const productInsufficientQuantity = () =>
      notification.warning({
        key: keyNoti,
        message: (
          <div>
            <div>S???n ph???m kh??ng ????? s??? l?????ng ????? b??n, b???n mu???n t???o ????n h??ng ?????t tr?????c ?</div>
            <ButtonsBottom />
          </div>
        ),
        style: { width: 550 },
      })

    if (product) {
      if (!product.active) {
        notification.warning({
          message: 'S???n ph???m n??y ???? t???t b??n, vui l??ng m??? b??n l???i ????? ti???p t???c',
        })
        return
      }

      //check product c?? ????? s??? l?????ng
      if (product.total_quantity !== 0) {
        const invoicesNew = [...invoices]
        const indexProduct = invoicesNew[indexInvoice].order_details.findIndex(
          (e) => e._id === product._id
        )

        //n???u ???? c?? s???n trong cart r???i th?? t??ng s??? l?????ng v?? t???ng ti???n c???a s???n ph???m ???? l??n
        //n???u ch??a c?? th?? push v??o gi??? h??ng
        if (indexProduct !== -1) {
          if (
            invoicesNew[indexInvoice].order_details[indexProduct].quantity < product.total_quantity
          ) {
            invoicesNew[indexInvoice].order_details[indexProduct].quantity++

            invoicesNew[indexInvoice].order_details[indexProduct].sumCost =
              +invoicesNew[indexInvoice].order_details[indexProduct].quantity *
              +invoicesNew[indexInvoice].order_details[indexProduct].price

            //thu??? VAT c???a m???i s???n ph???m
            invoicesNew[indexInvoice].order_details[indexProduct].VAT_Product =
              invoicesNew[indexInvoice].order_details[indexProduct]._taxes &&
              invoicesNew[indexInvoice].order_details[indexProduct]._taxes.length
                ? (
                    (invoicesNew[indexInvoice].order_details[indexProduct]._taxes.reduce(
                      (total, current) => total + current.value,
                      0
                    ) /
                      100) *
                    invoicesNew[indexInvoice].order_details[indexProduct].sumCost
                  ).toFixed(0)
                : 0
          } else
            notification.warning({
              message: 'S???n ph???m kh??ng ????? s??? l?????ng ????? b??n, vui l??ng ch???n s???n ph???m kh??c!',
              description: (
                <Button
                  onClick={() =>
                    window.open(`${ROUTES.IMPORT_INVENTORY}?_id=${product._id}`, '_blank')
                  }
                  type="primary"
                >
                  Nh???p kho s???n ph???m n??y
                </Button>
              ),
            })
        } else {
          invoicesNew[indexInvoice].order_details.push({
            quantity: 1, //s??? l?????ng s???n ph???m
            ...product,
            unit: product.units && product.units.length ? product.units[0].name : 'C??i', //????n v???
            sumCost: product.price, // t???ng gi?? ti???n
            VAT_Product:
              product._taxes && product._taxes.length
                ? (
                    (product._taxes.reduce((total, current) => total + current.value, 0) / 100) *
                    product.price
                  ).toFixed(0)
                : 0,
          })
        }
        // t???ng ti???n c???a t???t c??? s???n ph???m
        invoicesNew[indexInvoice].sumCostPaid = invoicesNew[indexInvoice].order_details.reduce(
          (total, current) => total + current.sumCost,
          0
        )

        //t???ng thu??? VAT c???a t???t c??? s???n ph???m
        invoicesNew[indexInvoice].VAT = invoicesNew[indexInvoice].order_details.reduce(
          (total, current) => total + +current.VAT_Product,
          0
        )

        //t???ng ti???n kh??ch h??ng ph???i tr???
        invoicesNew[indexInvoice].moneyToBePaidByCustomer =
          invoicesNew[indexInvoice].sumCostPaid +
          invoicesNew[indexInvoice].VAT +
          (invoicesNew[indexInvoice].isDelivery ? invoicesNew[indexInvoice].deliveryCharges : 0)

        //discount c?? 2 lo???i
        //n???u type = value th?? c???ng
        // n???u type = percent th?? nh??n
        if (invoicesNew[indexInvoice].discount) {
          if (invoicesNew[indexInvoice].discount.type === 'VALUE')
            invoicesNew[indexInvoice].moneyToBePaidByCustomer -=
              +invoicesNew[indexInvoice].discount.value
          else
            invoicesNew[indexInvoice].moneyToBePaidByCustomer -= (
              (+invoicesNew[indexInvoice].discount.value / 100) *
              invoicesNew[indexInvoice].moneyToBePaidByCustomer
            ).toFixed(0)
        }

        //m???c ?????nh cho s??? ti???n c???n thanh to??n = s??? ti???n ph???i tr???
        //khi c?? 1 ph????ng th???c thanh to??n
        if (invoicesNew[indexInvoice].payments.length === 1) {
          if (invoicesNew[indexInvoice].isDelivery)
            invoicesNew[indexInvoice].prepay = invoicesNew[indexInvoice].moneyToBePaidByCustomer
          else
            invoicesNew[indexInvoice].moneyGivenByCustomer =
              invoicesNew[indexInvoice].moneyToBePaidByCustomer

          invoicesNew[indexInvoice].payments = [
            {
              ...invoicesNew[indexInvoice].payments[0],
              value: invoicesNew[indexInvoice].moneyToBePaidByCustomer,
            },
          ]
        }

        //ti???n th???a
        const excessCashNew =
          (invoicesNew[indexInvoice].isDelivery
            ? invoicesNew[indexInvoice].prepay
            : invoicesNew[indexInvoice].moneyGivenByCustomer) -
          invoicesNew[indexInvoice].moneyToBePaidByCustomer

        invoicesNew[indexInvoice].excessCash = excessCashNew >= 0 ? excessCashNew : 0

        setInvoices([...invoicesNew])
      } else productInsufficientQuantity()
    }
  }

  const _removeProductToCartInvoice = (indexProduct) => {
    if (indexProduct !== -1) {
      const invoicesNew = [...invoices]
      invoicesNew[indexInvoice].order_details.splice(indexProduct, 1)

      //t???ng thu??? VAT c???a t???t c??? c??c s???n ph???m
      invoicesNew[indexInvoice].VAT = invoicesNew[indexInvoice].order_details.reduce(
        (total, current) => total + +current.VAT_Product,
        0
      )

      // t???ng ti???n c???a t???t c??? s???n ph???m
      invoicesNew[indexInvoice].sumCostPaid = invoicesNew[indexInvoice].order_details.reduce(
        (total, current) => total + current.sumCost,
        0
      )

      //t???ng ti???n kh??ch h??ng ph???i tr???
      invoicesNew[indexInvoice].moneyToBePaidByCustomer =
        invoicesNew[indexInvoice].sumCostPaid +
        invoicesNew[indexInvoice].VAT +
        (invoicesNew[indexInvoice].isDelivery ? invoicesNew[indexInvoice].deliveryCharges : 0)

      //discount c?? 2 lo???i
      //n???u type = value th?? c???ng
      // n???u type = percent th?? nh??n
      if (invoicesNew[indexInvoice].discount) {
        if (invoicesNew[indexInvoice].discount.type === 'VALUE')
          invoicesNew[indexInvoice].moneyToBePaidByCustomer -=
            +invoicesNew[indexInvoice].discount.value
        else
          invoicesNew[indexInvoice].moneyToBePaidByCustomer -= (
            (+invoicesNew[indexInvoice].discount.value / 100) *
            invoicesNew[indexInvoice].moneyToBePaidByCustomer
          ).toFixed(0)
      }

      //m???c ?????nh cho s??? ti???n c???n thanh to??n = s??? ti???n ph???i tr???
      //khi c?? 1 ph????ng th???c thanh to??n
      if (invoicesNew[indexInvoice].payments.length === 1) {
        if (invoicesNew[indexInvoice].isDelivery)
          invoicesNew[indexInvoice].prepay = invoicesNew[indexInvoice].moneyToBePaidByCustomer
        else
          invoicesNew[indexInvoice].moneyGivenByCustomer =
            invoicesNew[indexInvoice].moneyToBePaidByCustomer

        invoicesNew[indexInvoice].payments = [
          {
            ...invoicesNew[indexInvoice].payments[0],
            value: invoicesNew[indexInvoice].moneyToBePaidByCustomer,
          },
        ]
      }

      //ti???n th???a
      const excessCashNew =
        (invoicesNew[indexInvoice].isDelivery
          ? invoicesNew[indexInvoice].prepay
          : invoicesNew[indexInvoice].moneyGivenByCustomer) -
        invoicesNew[indexInvoice].moneyToBePaidByCustomer

      invoicesNew[indexInvoice].excessCash = excessCashNew >= 0 ? excessCashNew : 0

      setInvoices([...invoicesNew])
    }
  }

  const _editInvoice = (attribute, value) => {
    const invoicesNew = [...invoices]
    invoicesNew[indexInvoice][attribute] = value

    // t???ng ti???n c???a t???t c??? s???n ph???m
    invoicesNew[indexInvoice].sumCostPaid = invoicesNew[indexInvoice].order_details.reduce(
      (total, current) => total + current.sumCost,
      0
    )

    //t???ng thu??? VAT c???a t???t c??? s???n ph???m
    invoicesNew[indexInvoice].VAT = invoicesNew[indexInvoice].order_details.reduce(
      (total, current) => total + +current.VAT_Product,
      0
    )

    //t???ng ti???n kh??ch h??ng ph???i tr???
    invoicesNew[indexInvoice].moneyToBePaidByCustomer =
      invoicesNew[indexInvoice].sumCostPaid +
      invoicesNew[indexInvoice].VAT +
      (invoicesNew[indexInvoice].isDelivery ? invoicesNew[indexInvoice].deliveryCharges : 0)

    //discount c?? 2 lo???i
    //n???u type = value th?? c???ng
    // n???u type = percent th?? nh??n
    if (invoicesNew[indexInvoice].discount) {
      if (invoicesNew[indexInvoice].discount.type === 'VALUE')
        invoicesNew[indexInvoice].moneyToBePaidByCustomer -=
          +invoicesNew[indexInvoice].discount.value
      else
        invoicesNew[indexInvoice].moneyToBePaidByCustomer -= (
          (+invoicesNew[indexInvoice].discount.value / 100) *
          invoicesNew[indexInvoice].moneyToBePaidByCustomer
        ).toFixed(0)
    }

    //ti???n th???a
    const excessCashNew =
      (invoicesNew[indexInvoice].isDelivery
        ? invoicesNew[indexInvoice].prepay
        : invoicesNew[indexInvoice].moneyGivenByCustomer) -
      invoicesNew[indexInvoice].moneyToBePaidByCustomer

    invoicesNew[indexInvoice].excessCash = excessCashNew >= 0 ? excessCashNew : 0

    setInvoices([...invoicesNew])
  }

  const _editProductInInvoices = (attribute, value, index) => {
    if (index !== -1) {
      const invoicesNew = [...invoices]
      invoicesNew[indexInvoice].order_details[index][attribute] = value

      //t???ng ti???n c???a 1 s???n ph???m
      invoicesNew[indexInvoice].order_details[index].sumCost =
        +invoicesNew[indexInvoice].order_details[index].quantity *
        +invoicesNew[indexInvoice].order_details[index].price

      //thu??? VAT c???a m???i s???n ph???m
      invoicesNew[indexInvoice].order_details[index].VAT_Product =
        invoicesNew[indexInvoice].order_details[index]._taxes &&
        invoicesNew[indexInvoice].order_details[index]._taxes.length
          ? (
              (invoicesNew[indexInvoice].order_details[index]._taxes.reduce(
                (total, current) => total + current.value,
                0
              ) /
                100) *
              invoicesNew[indexInvoice].order_details[index].sumCost
            ).toFixed(0)
          : 0

      //t???ng thu??? VAT c???a t???t c??? c??c s???n ph???m
      invoicesNew[indexInvoice].VAT = invoicesNew[indexInvoice].order_details.reduce(
        (total, current) => total + +current.VAT_Product,
        0
      )

      // t???ng ti???n c???a t???t c??? s???n ph???m
      invoicesNew[indexInvoice].sumCostPaid = invoicesNew[indexInvoice].order_details.reduce(
        (total, current) => total + current.sumCost,
        0
      )

      //t???ng ti???n kh??ch h??ng ph???i tr???
      invoicesNew[indexInvoice].moneyToBePaidByCustomer =
        invoicesNew[indexInvoice].sumCostPaid +
        invoicesNew[indexInvoice].VAT +
        (invoicesNew[indexInvoice].isDelivery ? invoicesNew[indexInvoice].deliveryCharges : 0)

      //discount c?? 2 lo???i
      //n???u type = value th?? c???ng
      // n???u type = percent th?? nh??n
      if (invoicesNew[indexInvoice].discount) {
        if (invoicesNew[indexInvoice].discount.type === 'VALUE')
          invoicesNew[indexInvoice].moneyToBePaidByCustomer -=
            +invoicesNew[indexInvoice].discount.value
        else
          invoicesNew[indexInvoice].moneyToBePaidByCustomer -= (
            (+invoicesNew[indexInvoice].discount.value / 100) *
            invoicesNew[indexInvoice].moneyToBePaidByCustomer
          ).toFixed(0)
      }

      //m???c ?????nh cho s??? ti???n c???n thanh to??n = s??? ti???n ph???i tr???
      //khi c?? 1 ph????ng th???c thanh to??n
      if (invoicesNew[indexInvoice].payments.length === 1) {
        if (invoicesNew[indexInvoice].isDelivery)
          invoicesNew[indexInvoice].prepay = invoicesNew[indexInvoice].moneyToBePaidByCustomer
        else
          invoicesNew[indexInvoice].moneyGivenByCustomer =
            invoicesNew[indexInvoice].moneyToBePaidByCustomer

        invoicesNew[indexInvoice].payments = [
          {
            ...invoicesNew[indexInvoice].payments[0],
            value: invoicesNew[indexInvoice].moneyToBePaidByCustomer,
          },
        ]
      }

      //ti???n th???a
      const excessCashNew =
        (invoicesNew[indexInvoice].isDelivery
          ? invoicesNew[indexInvoice].prepay
          : invoicesNew[indexInvoice].moneyGivenByCustomer) -
        invoicesNew[indexInvoice].moneyToBePaidByCustomer

      invoicesNew[indexInvoice].excessCash = excessCashNew >= 0 ? excessCashNew : 0

      setInvoices([...invoicesNew])
    }
  }

  const ModalQuantityProductInStores = ({ product, btn }) => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)
    // console.log(product)
    const [locations, setLocations] = useState([])

    const column = [
      { title: 'Chi nh??nh', dataIndex: 'name' },
      {
        title: 'S??? l?????ng',
        render: (text, record) => formatCash(record.quantity || 0),
      },
    ]

    const content = (
      <div>
        <Row justify="space-between">
          <span>Gi?? nh???p</span>
          <span>
            {formatCash(product ? product.import_price || product.import_price_default : 0)}
          </span>
        </Row>
        <Row justify="space-between">
          <span>Gi?? c?? b???n</span>
          <span>{formatCash(product ? product.base_price : 0)}</span>
        </Row>
        <Row justify="space-between">
          <span>Gi?? b??n</span>
          <span>{formatCash(product ? product.price : 0)}</span>
        </Row>
        <Row justify="space-between">
          <span>C?? th??? b??n</span>
          <span>{formatCash(product ? product.total_quantity : 0)}</span>
        </Row>
      </div>
    )

    useEffect(() => {
      for (let i = 0; i < productsAllBranch.length; i++) {
        for (let j = 0; j < productsAllBranch[i].variants.length; j++) {
          const findVariant = productsAllBranch[i].variants.find((e) => e.variant_id === product.variant_id)
          if (findVariant) {
            // console.log(findVariant)
            setLocations([...findVariant.locations])
            break
          }
        }
      }
    }, [])

    return (
      <div onClick={(e) => e.stopPropagation()}>
        {btn ? (
          <Button
            type="primary"
            onClick={toggle}
            style={{
              cursor: 'pointer',
            }}
          >
            {btn}
          </Button>
        ) : (
          <Popover
            content={content}
            placement="bottom"
            title={
              <Row
                wrap={false}
                justify="space-between"
                align="middle"
                style={{ maxWidth: 450, minWidth: 250 }}
              >
                <p
                  style={{
                    marginBottom: 0,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    '-webkit-line-clamp': '1',
                    '-webkit-box-orient': 'vertical',
                    display: '-webkit-box',
                  }}
                >
                  Th??ng tin s???n ph???m: {product && product.title}
                </p>
                <SearchOutlined onClick={toggle} style={{ cursor: 'pointer', marginLeft: 30 }} />
              </Row>
            }
          >
            <ExclamationCircleOutlined
              style={{ color: '#1991FF', fontSize: 12, cursor: 'pointer', marginLeft: 6 }}
            />
          </Popover>
        )}

        <Modal
          width={700}
          footer={
            <Row justify="end">
              <Button onClick={toggle}>????ng</Button>
            </Row>
          }
          visible={visible}
          onCancel={toggle}
          title={product && product.title}
        >
          <Table
            pagination={false}
            style={{ width: '100%' }}
            columns={column}
            size="small"
            dataSource={locations}
          />
        </Modal>
      </div>
    )
  }

  const NoteInvoice = () => (
    <Input.TextArea
      onBlur={(e) => _editInvoice('noteInvoice', e.target.value)}
      defaultValue={invoices[indexInvoice].noteInvoice || ''}
      rows={2}
      placeholder="Nh???p ghi ch?? ????n h??ng"
      style={{ width: '100%' }}
    />
  )

  const ModalNoteProduct = ({ product, index }) => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)

    const [note, setNote] = useState(product.note || '')

    return (
      <>
        <div
          onClick={toggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 12,
            color: 'gray',
            cursor: 'pointer',
          }}
        >
          <p className={styles['sell-product__item-note']}>{note || 'Ghi ch??'}</p>
          <EditOutlined style={{ marginLeft: 5 }} />
        </div>
        <Modal
          title={product && product.title}
          onCancel={() => {
            toggle()
            setNote(product.note || '')
          }}
          onOk={() => {
            _editProductInInvoices('note', note, index)
          }}
          visible={visible}
        >
          <div>
            Ghi ch??
            <Input.TextArea
              onChange={(e) => setNote(e.target.value)}
              value={note}
              placeholder="Nh???p ghi ch??"
              rows={4}
              style={{ width: '100%' }}
            />
          </div>
        </Modal>
      </>
    )
  }

  const ModalSkuProduct = ({ product, index }) => {
    const [visible, setVisible] = useState(false)

    const [sku, setSku] = useState(product.sku || '')
    const [variant, setVariant] = useState(null)
    const [variants, setVariants] = useState([])
    const [loading, setLoading] = useState(false)

    const toggle = () => {
      setVisible(!visible)
      setSku(product.sku || '')
    }

    const _getVariantsByProductId = async () => {
      try {
        setLoading(true)
        const res = await getProducts({
          branch_id: infoBranch.branch_id || '',
          merge: true,
          detach: true,
          product_id: product.product_id,
        })
        if (res.status === 200) {
          const variantList = res.data.data.map((e) => e.variants)
          setVariants(variantList.filter((variant) => variant.total_quantity))
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.log(error)
      }
    }

    const _updateProductInCart = () => {
      if (variant) {
        let productsNew = invoices[indexInvoice].order_details
        // const price = variant.units && variant.units.length ? variant.units[0].price : 20000
        productsNew[index] = {
          ...variant,
          unit: variant.units && variant.units.length ? variant.units[0].name : 'C??i', //????n v???
          price: variant.price, //gi?? s???n ph???m
          quantity: 1, //s??? l?????ng s???n ph???m
          sumCost: variant.price, // t???ng gi?? ti???n
          VAT_Product:
            variant._taxes && variant._taxes.length
              ? (
                  (variant._taxes.reduce((total, current) => total + current.value, 0) / 100) *
                  variant.price
                ).toFixed(0)
              : 0,
        }

        _editInvoice('order_details', [...productsNew])
      }

      setVisible(false)
    }

    useEffect(() => {
      _getVariantsByProductId()
    }, [])

    return (
      <>
        <Tooltip title={product.sku}>
          <p className={styles['sell-product__item-sku']} onClick={toggle}>
            {product.sku}
          </p>
        </Tooltip>
        <Modal
          cancelText="H???y b???"
          okText="C???p nh???t"
          title="C???p nh???t thu???c t??nh"
          onCancel={() => {
            toggle()
            setSku(product.sku || '')
          }}
          onOk={_updateProductInCart}
          visible={visible}
        >
          <div>
            T??n thu???c t??nh
            <Select
              loading={loading}
              showSearch
              optionFilterProp="children"
              value={sku}
              onChange={(value) => {
                const skuProduct = invoices[indexInvoice].order_details.find((v) => v.sku === value)
                if (skuProduct)
                  notification.warning({
                    message: '???? c?? s???n ph???m n??y ??? trong gi??? h??ng, vui l??ng ch???n s???n ph???m kh??c',
                  })
                else {
                  setSku(value)
                  const variantFind = variants.find((e) => e.sku === value)
                  setVariant(variantFind)
                }
              }}
              placeholder="Ch???n t??n thu???c t??nh"
              style={{ width: '100%' }}
            >
              {variants.map((variant, index) => (
                <Select.Option value={variant.sku || ''} key={index}>
                  {variant.sku || ''}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Modal>
      </>
    )
  }

  const ModalAddCustomer = () => {
    return (
      <>
        <Tooltip placement="bottom" title="Th??m m???i kh??ch h??ng">
          <PlusSquareFilled
            onClick={toggleCustomer}
            style={{
              fontSize: 34,
              color: '#0362BA',
              cursor: 'pointer',
            }}
          />
        </Tooltip>
        <Modal
          style={{ top: 20 }}
          onCancel={toggleCustomer}
          width={800}
          footer={null}
          title="Th??m kh??ch h??ng m???i"
          visible={visibleCreateCustomer}
        >
          <CustomerForm close={toggleCustomer} text="Th??m" reload={_getCustomers} />
        </Modal>
      </>
    )
  }

  const ModalUpdateCustomer = ({ children, record }) => {
    return (
      <>
        <div onClick={toggleUpdateCustomer}>{children}</div>
        <Modal
          style={{ top: 20 }}
          onCancel={toggleUpdateCustomer}
          width={800}
          footer={null}
          title="C???p nh???t kh??ch h??ng"
          visible={visibleUpdateCustomer}
        >
          <CustomerForm
            record={record}
            close={toggleUpdateCustomer}
            text="L??u"
            reload={() => {
              _getCustomerAfterEditCustomer()
              _getCustomers()
            }}
          />
        </Modal>
      </>
    )
  }

  const HandlerKeyboard = () => {
    return (
      <KeyboardEventHandler
        handleKeys={['f1', 'f2', 'f4', 'f8', 'f9']}
        onKeyEvent={(key, e) => {
          switch (key) {
            case 'f1': {
              _validatedCreateOrderOrPay()
              break
            }
            case 'f2': {
              inputRef.current.focus({ cursor: 'end' })
              break
            }
            case 'f4': {
              toggleCustomer()
              break
            }
            case 'f8': {
              setVisiblePayments(true)
              break
            }
            case 'f9': {
              _createInvoice()
              break
            }
            default:
              break
          }
        }}
      />
    )
  }

  const ModalConfirmCreateOrderOrPay = () => {
    return (
      <Modal
        onOk={() => {
          setVisibleConfirmCreateOrder(false)
          _createOrder()
        }}
        cancelText="Tho??t"
        okText="?????ng ??"
        visible={visibleConfirmCreateOrder}
        onCancel={() => setVisibleConfirmCreateOrder(false)}
        title="S??? ti???n thanh to??n ch??a ?????"
      >
        S??? ti???n kh??ch ????a ??ang nh??? h??n s??? ti???n m?? kh??ch ph???i tr???. B???n c?? ch???c ch???n mu???n ti???p t???c
        thanh to??n? ????n h??ng s??? kh??ng ???????c ghi nh???n ho??n th??nh ?????n khi ???????c thanh to??n to??n b???.
      </Modal>
    )
  }

  const _validatedBeforeCreateOrderOrPay = () => {
    if (invoices[indexInvoice].isDelivery && !invoices[indexInvoice].customer) {
      notification.warning({ message: 'Vui l??ng th??m kh??ch h??ng ????? s??? d???ng d???ch v??? giao h??ng' })
      return false
    }

    if (invoices[indexInvoice].order_details.length === 0) {
      notification.warning({ message: 'Vui l??ng ch???n s???n ph???m v??o ????n h??ng' })
      return false
    }

    if (invoices[indexInvoice].payments.length === 0) {
      notification.warning({ message: 'Vui l??ng ch???n ph????ng th???c thanh to??n' })
      return false
    }

    if (
      !invoices[indexInvoice].isDelivery &&
      invoices[indexInvoice].moneyGivenByCustomer < invoices[indexInvoice].moneyToBePaidByCustomer
    ) {
      setVisibleConfirmCreateOrder(true)
      return
    }

    return true
  }

  const _validatedCreateOrderOrPay = () => {
    const isValidated = _validatedBeforeCreateOrderOrPay()
    if (!isValidated) return

    _createOrder()
  }

  const _createOrder = async () => {
    try {
      let shipping = {}

      if (invoices[indexInvoice].isDelivery)
        if (invoices[indexInvoice].shipping) {
          shipping.shipping_company_id = invoices[indexInvoice].shipping.shipping_company_id || ''
          shipping.shipping_info = {
            ship_code: invoices[indexInvoice].shipping.code || '',
            to_name: infoBranch.name || '',
            to_phone: infoBranch.phone || '',
            to_address: infoBranch.address || '',
            to_ward: '',
            to_district: infoBranch.district || '',
            to_province: infoBranch.province || '',
            to_province_code: '',
            to_postcode: 70000,
            to_country_code: '',
            return_name: `${invoices[indexInvoice].deliveryAddress.first_name || ''} ${
              invoices[indexInvoice].deliveryAddress.last_name || ''
            }`,
            return_phone: invoices[indexInvoice].deliveryAddress.phone || '',
            return_address: invoices[indexInvoice].deliveryAddress.address || '',
            return_ward: '',
            return_district: invoices[indexInvoice].deliveryAddress.district || '',
            return_province: invoices[indexInvoice].deliveryAddress.province || '',
            return_province_code: '',
            return_postcode_code: 70000,
            return_country_code: '',
            cod: 0,
            fee_shipping: invoices[indexInvoice].deliveryCharges || 0,
            delivery_time: '2021-09-30T00:00:00+07:00',
            complete_time: '2021-10-30T00:00:00+07:00',
          }
        } else {
          notification.warning({ message: 'B???n ch??a ch???n ????n v??? v???n chuy???n!' })
          return
        }

      dispatch({ type: ACTION.LOADING, data: true })
      const body = {
        ...shipping,
        sale_location: { branch_id: infoBranch.branch_id || '' },
        customer_id: invoices[indexInvoice].customer
          ? invoices[indexInvoice].customer.customer_id
          : '',
        employee_id: dataUser ? dataUser.data.user_id || '' : '',
        order_details: invoices[indexInvoice].order_details.map((product) => ({
          product_id: product.product_id || '',
          variant_id: product.variant_id || '',
          quantity: product.quantity || 0,
          price: product.price || 0,
          total_cost: product.sumCost || 0,
          discount: product.VAT_Product || 0,
          final_cost: product.sumCost || 0,
        })),
        payments: invoices[indexInvoice].payments,
        voucher: invoices[indexInvoice].discount ? invoices[indexInvoice].discount.name || '' : '',
        promotion_id: invoices[indexInvoice].discount
          ? invoices[indexInvoice].discount.promotion_id || ''
          : '',
        // total_cost: invoices[indexInvoice].sumCostPaid || 0,
        total_cost: invoices[indexInvoice].order_details.reduce(
          (total, current) => total + current.sumCost,
          0
        ),
        total_tax: invoices[indexInvoice].VAT || 0,
        total_discount:
          invoices[indexInvoice].sumCostPaid - invoices[indexInvoice].moneyToBePaidByCustomer,
        final_cost: invoices[indexInvoice].moneyToBePaidByCustomer || 0,
        customer_paid: invoices[indexInvoice].isDelivery
          ? invoices[indexInvoice].prepay || 0
          : invoices[indexInvoice].moneyGivenByCustomer || 0,
        customer_debt: 0,
        bill_status: invoices[indexInvoice].order_details.find(
          (product) => product.total_quantity === 0
        )
          ? 'PRE-ORDER'
          : 'COMPLETE', // n???u trong ????n h??ng c?? s???n ph???m b??? h???t sl -> ????n h??ng b??n tr?????c
        ship_status: SHIP_STATUS_ORDER.DRAFT,
        note: invoices[indexInvoice].noteInvoice || '',
        tags: [],
        channel: invoices[indexInvoice].salesChannel,
        is_delivery: invoices[indexInvoice].isDelivery,
      }

      //encrypt body create order
      const bodyEncryption = encryptText(JSON.stringify(body))
      console.log(body)

      const res = await addOrder({ order: bodyEncryption })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          _getProductsRelated()
          _getProductsSearch()
          _getProducts()
          _editInvoice('code', res.data.data.code || '')
          handlePrint()
        } else
          notification.error({
            message: res.data.message || `T???o ????n h??ng th???t b???i, vui l??ng th??? l???i`,
          })
      } else
        notification.error({
          message: res.data.message || `T???o ????n h??ng th???t b???i, vui l??ng th??? l???i`,
        })

      if (res.status === 200 && res.data.success) _deleteInvoiceAfterCreateOrder()

      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(error)
    }
  }

  const _getBranches = async () => {
    try {
      setLoadingBranch(true)
      const res = await getAllBranch()
      if (res.status === 200) setBranches(res.data.data)
      setLoadingBranch(false)
    } catch (error) {
      setLoadingBranch(false)
      console.log(error)
    }
  }

  const _getCustomers = async () => {
    try {
      setLoadingCustomer(true)
      const res = await getCustomers()
      if (res.status === 200) {
        setCustomers(res.data.data)

        //m???c ?????nh ch???n kh??ch l???
        const customer = res.data.data.find((e) => e.customer_id === 1)
        if (customer && !invoices[indexInvoice].customer) {
          _editInvoice('deliveryAddress', customer)
          _editInvoice('customer', customer)
          _editInvoice('name', `${customer.first_name} ${customer.last_name}`)
        }
      }

      setLoadingCustomer(false)
    } catch (error) {
      setLoadingCustomer(false)
      console.log(error)
    }
  }

  const _getCustomerAfterEditCustomer = async () => {
    try {
      setLoadingCustomer(true)

      const res = await getCustomers({
        customer_id: invoices[indexInvoice].customer.customer_id,
      })
      if (res.status === 200)
        if (res.data.data.length) {
          const invoicesNew = [...invoices]
          invoices[indexInvoice].customer = res.data.data[0]
          invoicesNew[
            indexInvoice
          ].name = `${res.data.data[0].first_name} ${res.data.data[0].last_name} - ${res.data.data[0].phone}`
          setInvoices([...invoicesNew])
        }

      setLoadingCustomer(false)
    } catch (error) {
      setLoadingCustomer(false)
      console.log(error)
    }
  }

  const _getPayments = async () => {
    try {
      const res = await getPayments()
      if (res.status === 200) {
        let paymentMethodDefault = ''
        res.data.data.map((e) => {
          if (e.default && e.active) paymentMethodDefault = e.name
        })
        if (paymentMethodDefault) {
          const pDefault = { method: paymentMethodDefault, value: 0 }
          _editInvoice('payments', [pDefault])
          setPaymentMethodDefault(pDefault)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _getShippingsMethod = async () => {
    try {
      const res = await getShippings()
      if (res.status === 200) {
        setShippingsMethod(res.data.data)
        if (!invoices[indexInvoice].shipping) {
          const shippingDefault = res.data.data.find((s) => s.default && s.active)
          if (shippingDefault) _editInvoice('shipping', shippingDefault)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _getProducts = async () => {
    try {
      const res = await getProducts({ merge: true, branch_id: branchIdApp || '' })
      console.log(res)
      if (res.status === 200) setProductsAllBranch(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getProductsSearch = async () => {
    try {
      setLoadingProduct(true)
      const res = await getProducts({ branch_id: branchIdApp, merge: true, detach: true })
      if (res.status === 200)
        setProductsSearch(res.data.data.map((e) => ({ ...e.variants, active: e.active })))
      setLoadingProduct(false)
    } catch (error) {
      console.log(error)
      setLoadingProduct(false)
    }
  }

  const _getProductsRelated = async (params) => {
    try {
      setLoadingProductRelated(true)

      const res = await getProducts({ branch_id: branchIdApp || '', detach: true, ...params })
      console.log(res)
      if (res.status === 200) {
        setProductsRelated(res.data.data.map((e) => ({ ...e.variants, active: e.active })))
        setCountProducts(res.data.count)
      }

      setLoadingProductRelated(false)
    } catch (error) {
      console.log(error)
      setLoadingProductRelated(false)
    }
  }

  //get invoice t??? reducer (local storage)
  const _getInvoicesToReducer = () => {
    if (invoicesSelector && invoicesSelector.length) {
      setInvoices([...invoicesSelector])
      setActiveKeyTab(invoicesSelector[0].id)
    } else {
      setInvoices([initInvoice])
      setActiveKeyTab(initInvoice.id)
    }
  }
  //l??u invoice l??n reducer m???i khi c?? s??? thay ?????i
  useEffect(() => {
    if (invoices) dispatch({ type: 'UPDATE_INVOICE', data: invoices })
  }, [invoices])

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) history.push(ROUTES.LOGIN)
  }, [])

  useEffect(() => {
    if (branches.length) {
      const branch = branches.find((branch) => branch.branch_id === branchIdApp)
      if (branch) setInfoBranch(branch)
    }
  }, [branchIdApp, branches])

  useEffect(() => {
    _getInvoicesToReducer()
    _getCustomers()
    _getPayments()
    _getShippingsMethod()
    _getBranches()
  }, [])

  useEffect(() => {
    _getProducts()
    _getProductsSearch()
  }, [branchIdApp])

  useEffect(() => {
    _getProductsRelated(paramsFilter)
  }, [paramsFilter, branchIdApp])

  const Print = () => (
    <div style={{ display: 'none' }}>
      <PrintOrder ref={printOrderRef} data={invoices[indexInvoice]} />
    </div>
  )

  return (
    <div className={styles['sell-container']}>
      <HandlerKeyboard />
      <ModalConfirmCreateOrderOrPay />
      <Print />

      <div className={styles['sell-header']}>
        <Row align="middle" wrap={false}>
          <div className="select-product-sell ">
            <Select
              notFoundContent={loadingProduct ? <Spin size="small" /> : null}
              dropdownClassName="dropdown-select-search-product"
              allowClear
              showSearch
              clearIcon={<CloseOutlined style={{ color: 'black' }} />}
              suffixIcon={<SearchOutlined style={{ color: 'black', fontSize: 15 }} />}
              className={styles['search-product']}
              placeholder="Th??m s???n ph???m v??o ho?? ????n"
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
                        <PlusSquareOutlined
                          style={{
                            fontSize: 19,
                          }}
                        />
                      </div>
                      <p
                        style={{
                          marginLeft: 20,
                          marginBottom: 0,
                          fontSize: 16,
                        }}
                      >
                        Th??m s???n ph???m m???i
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
                      _addProductToCartInvoice(data)
                      e.stopPropagation()
                    }}
                  >
                    <img
                      src={data.image[0] ? data.image[0] : IMAGE_DEFAULT}
                      alt=""
                      style={{
                        minWidth: 55,
                        minHeight: 55,
                        maxWidth: 55,
                        maxHeight: 55,
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
                        <p style={{ marginBottom: 0, fontWeight: 500 }}>{formatCash(data.price)}</p>
                      </Row>
                      <Row wrap={false} justify="space-between">
                        <p style={{ marginBottom: 0, fontWeight: 500 }}>
                          {data.active ? (
                            '??ang m??? b??n'
                          ) : (
                            <div style={{ color: '#ff6666' }}>???? t???t b??n</div>
                          )}
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
              ))}
            </Select>
          </div>
          <ScanProduct
            productsCurrent={invoices[indexInvoice].order_details}
            addProductToCartInvoice={_addProductToCartInvoice}
          />
        </Row>
        <Row align="middle" style={{ marginLeft: 30 }} className={styles['tab-sell']}>
          <Tabs
            hideAdd={invoices.length > 9 && true}
            moreIcon={<MoreOutlined style={{ color: 'white', fontSize: 16 }} />}
            activeKey={activeKeyTab}
            onEdit={(key, action) => {
              if (action === 'add') _createInvoice()
            }}
            onChange={(activeKey) => {
              const iVoice = invoices.findIndex((e) => e.id === activeKey)
              if (iVoice !== -1) setIndexInvoice(iVoice)
              setActiveKeyTab(activeKey)
            }}
            tabBarStyle={{ height: 48, color: 'white' }}
            type="editable-card"
            className="tabs-invoices"
            addIcon={
              <Tooltip title="Th??m m???i ????n h??ng">
                <PlusOutlined style={{ color: 'white', fontSize: 21, marginLeft: 7 }} />
              </Tooltip>
            }
          >
            {invoices.map((invoice, index) => (
              <Tabs.TabPane
                closeIcon={
                  <Popconfirm
                    okText="?????ng ??"
                    cancelText="T??? ch???i"
                    title="B???n c?? mu???n xo?? ho?? ????n n??y ?"
                    onConfirm={() => _deleteInvoice(invoice, index)}
                  >
                    <CloseCircleOutlined
                      style={{
                        display: invoices.length === 1 && 'none',
                        fontSize: 15,
                        color: invoice.id === activeKeyTab ? 'black' : 'white',
                      }}
                    />
                  </Popconfirm>
                }
                tab={
                  <>
                    <Tooltip title={invoice.name} mouseEnterDelay={1} className="tab-sell">
                      <p
                        style={{
                          marginBottom: 0,
                          color: invoice.id === activeKeyTab ? 'black' : 'white',
                        }}
                      >
                        {invoice.name}
                      </p>
                    </Tooltip>
                  </>
                }
                key={invoice.id}
                style={{ display: 'none' }}
              />
            ))}
          </Tabs>
        </Row>
        <Row
          wrap={false}
          align="middle"
          justify="space-between"
          style={{ width: '100%', marginLeft: 15 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ModalChangeBranch
              resetInvoice={() => setInvoices([initInvoice])}
              branch={infoBranch}
              loading={loadingBranch}
              branches={branches}
            />
            <ModalInfoSeller />
          </div>
          <ModalKeyboardShortCuts />
          <HeaderGroupButton />
        </Row>
      </div>
      <div className={styles['sell-content']}>
        <div className={styles['sell-left']}>
          <div className={styles['sell-products-invoice']}>
            {invoices[indexInvoice].order_details && invoices[indexInvoice].order_details.length ? (
              <>
                <Row
                  justify="space-between"
                  align="middle"
                  wrap={false}
                  className={styles['sell-product-header']}
                >
                  {/* <Row> */}
                    <div className={styles['header-stt']}>STT</div>
                    <div className={styles['header-remove']}></div>
                    <div className={styles['header-name']}>T??n s???n ph???m</div>
                    <div className={styles['header-remove']}></div>
                    <div className={styles['header-sku']}>T??n thu???c t??nh</div>
                    <div className={styles['header-unit']}>????n v???</div>
                  {/* </Row> */}
                  <div className={styles['header-quantity']}>S??? l?????ng</div>
                  <div className={styles['header-price']}>????n gi??</div>
                  <div className={styles['header-sum-price']}>T???ng ti???n</div>
                </Row>
                {invoices[indexInvoice].order_details.map((product, index) => {
                  const Quantity = () => (
                    <InputNumber
                      onBlur={(e) => {
                        const value = e.target.value.replaceAll(',', '')
                        _editProductInInvoices('quantity', +value, index)
                      }}
                      defaultValue={product.quantity || 1}
                      className="show-handler-number"
                      style={{ width: '100%' }}
                      bordered={false}
                      max={product.total_quantity}
                      min={1}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="S??? l?????ng"
                    />
                  )

                  const Price = () => (
                    <InputNumber
                      onBlur={(e) => {
                        const value = e.target.value.replaceAll(',', '')
                        _editProductInInvoices('price', +value, index)
                      }}
                      defaultValue={product.price || ''}
                      min={0}
                      style={{ width: '100%' }}
                      bordered={false}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="Gi?? ti???n"
                    />
                  )

                  const Unit = () => (
                    <Select
                      allowClear
                      showSearch
                      onChange={(value) => {
                        _editProductInInvoices('unit', value, index)
                        if (value) {
                          if (product.units) {
                            const variantFind = product.units.find((e) => e.name == value)
                            if (variantFind)
                              _editProductInInvoices('price', +variantFind.price, index)
                          }
                        }
                      }}
                      defaultValue={product.unit || undefined}
                      style={{ width: '100%' }}
                      placeholder="????n v???"
                      bordered={false}
                    >
                      {product.units ? (
                        product.units.map((unit, index) => (
                          <Select.Option key={index} value={unit.name}>
                            {unit.name}
                          </Select.Option>
                        ))
                      ) : (
                        <Select.Option value="C??i">C??i</Select.Option>
                      )}
                    </Select>
                  )

                  return (
                    <Row align="middle" wrap={false} className={styles['sell-product__item']}>
                      <Row wrap={false} align="middle">
                        <p
                          style={{
                            marginBottom: 0,
                            marginRight: 15,
                            width: 17,
                            textAlign: 'center',
                          }}
                        >
                          {index}
                        </p>
                        <DeleteOutlined
                          onClick={() => _removeProductToCartInvoice(index)}
                          style={{ color: 'red', marginRight: 15, cursor: 'pointer' }}
                        />

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title={product.title}>
                              <p className={styles['sell-product__item-name']}>{product.title}</p>
                            </Tooltip>
                            <ModalQuantityProductInStores product={product} />
                          </div>
                          <ModalNoteProduct product={product} index={index} />
                        </div>

                        <ModalSkuProduct product={product} index={index} />
                      </Row>
                      <Row
                        wrap={false}
                        justify="space-between"
                        align="middle"
                        style={{ marginLeft: 20, marginRight: 10, width: '100%' }}
                      >
                        <div className={styles['sell-product__item-unit']}>
                          <Unit />
                        </div>
                        <div className={styles['sell-product__item-quantity']}>
                          <Quantity />
                        </div>
                        <div className={styles['sell-product__item-price']}>
                          <Price />
                        </div>
                        <p style={{ marginBottom: 0, fontWeight: 600 }}>
                          {formatCash(product.sumCost)}
                        </p>
                      </Row>
                    </Row>
                  )
                })}
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                }}
              >
                <img src={noData} alt="" style={{ width: 100, height: 100 }} />
                <h3>????n h??ng c???a b???n ch??a c?? s???n ph???m</h3>
              </div>
            )}
          </div>
          <div className={styles['sell-products-related']}>
            <Row justify="space-between" align="middle">
              <Space size="middle">
                <FilterProductsByCategory
                  setParamsFilter={setParamsFilter}
                  paramsFilter={paramsFilter}
                />
                <FilterProductsBySku
                  setParamsFilter={setParamsFilter}
                  paramsFilter={paramsFilter}
                />
                <Row align="middle" wrap={false}>
                  {paramsFilter &&
                    Object.keys(paramsFilter).map((key) => {
                      if (key === 'category_id')
                        return (
                          <Tag
                            closable
                            onClose={() => {
                              delete paramsFilter.category_id
                              setParamsFilter({ ...paramsFilter })
                            }}
                          >
                            ??ang l???c theo nh??m s???n ph???m
                          </Tag>
                        )

                      if (key === 'attribute')
                        return (
                          <Tag
                            closable
                            onClose={() => {
                              delete paramsFilter.attribute
                              setParamsFilter({ ...paramsFilter })
                            }}
                          >
                            ??ang l???c theo thu???c t??nh
                          </Tag>
                        )
                    })}
                </Row>
              </Space>
              <Pagination
                current={paramsFilter.page}
                size="small"
                showSizeChanger={false}
                total={countProducts}
                onChange={(page, pageSize) => {
                  paramsFilter.page = page
                  paramsFilter.page_size = pageSize

                  setParamsFilter({ ...paramsFilter })
                }}
              />
            </Row>
            <div className={styles['list-product-related']}>
              {loadingProductRelated ? (
                <Row justify="center" align="middle" style={{ width: '100%', height: 320 }}>
                  <Spin />
                </Row>
              ) : productsRelated.length ? (
                <Row wrap={true}>
                  {productsRelated.map((product) => (
                    <div className={styles['product-item-wrap']}>
                      <div
                        style={{ borderColor: product.total_quantity === 0 && 'red' }}
                        onClick={() => _addProductToCartInvoice(product)}
                        className={styles['product-item']}
                      >
                        <img
                          src={product.image[0] ? product.image[0] : IMAGE_DEFAULT}
                          alt=""
                          style={{
                            width: '100%',
                            height: '70%',
                            objectFit: product.image[0] ? 'cover' : 'contain',
                          }}
                        />
                        <Row
                          justify="space-between"
                          wrap={false}
                          align="middle"
                          style={{ paddingLeft: 5, paddingRight: 5, marginTop: 3 }}
                        >
                          <p className={styles['product-item__name']}>{product.title}</p>
                          <ModalQuantityProductInStores product={product} />
                        </Row>
                        <Row justify="space-between" wrap={false} align="middle">
                          <p className={styles['product-item__price']}>
                            {formatCash(product.price)} VN??
                          </p>
                          <p  className={styles['product-item__price']}>
                            {product.active ? (
                              'M??? b??n'
                            ) : (
                              <div style={{ color: '#FF6666' }} className={styles['product-item__price']}>T???t b??n</div>
                            )}
                          </p>
                        </Row>
                      </div>
                    </div>
                  ))}
                </Row>
              ) : (
                <div
                  style={{
                    height: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img src={noData} alt="" style={{ width: 100 }} />
                  <h3>Kh??ng t??m th???y s???n ph???m n??o</h3>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles['sell-right']}>
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
                      _editInvoice('deliveryAddress', customer)
                      _editInvoice('customer', customer)
                      _editInvoice('name', `${customer.first_name} ${customer.last_name}`)
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
                        display:
                          invoices[indexInvoice] &&
                          invoices[indexInvoice].customer &&
                          invoices[indexInvoice].customer._id === customer._id
                            ? ''
                            : 'none',
                      }}
                    />
                  </Row>
                </Select.Option>
              ))}
            </Select>

            <Permission permissions={[PERMISSIONS.them_khach_hang]}>
              <ModalAddCustomer />
            </Permission>
          </Row>
          <Row
            wrap={false}
            align="middle"
            style={{ display: !invoices[indexInvoice].customer && 'none', marginTop: 15 }}
          >
            <UserOutlined style={{ fontSize: 28, marginRight: 15 }} />
            <div style={{ width: '100%' }}>
              <Row wrap={false} align="middle">
                {invoices[indexInvoice].customer ? (
                  <Permission permissions={[PERMISSIONS.cap_nhat_khach_hang]}>
                    <ModalUpdateCustomer record={invoices[indexInvoice].customer}>
                      <a style={{ fontWeight: 600, marginRight: 5, color: '#1890ff' }}>
                        {invoices[indexInvoice].customer &&
                          invoices[indexInvoice].customer.first_name +
                            ' ' +
                            invoices[indexInvoice].customer.last_name}
                      </a>
                    </ModalUpdateCustomer>
                  </Permission>
                ) : (
                  <div></div>
                )}

                <span style={{ fontWeight: 500 }}>
                  {' '}
                  - {invoices[indexInvoice].customer && invoices[indexInvoice].customer.phone}
                </span>
              </Row>
              <Row wrap={false} justify="space-between" align="middle">
                <div>
                  <span style={{ fontWeight: 600 }}>C??ng n???: </span>
                  <span>
                    {invoices[indexInvoice].customer && invoices[indexInvoice].customer.debt}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>??i???m hi???n t???i: </span>
                  <span>
                    {invoices[indexInvoice].customer && invoices[indexInvoice].customer.point}
                  </span>
                </div>
              </Row>
            </div>
            <Popconfirm
              title="B???n c?? mu???n xo?? kh??ch h??ng n??y ?"
              okText="?????ng ??"
              cancelText="T??? ch???i"
              onConfirm={async () => {
                _editInvoice('deliveryAddress', null)
                _editInvoice('customer', null)
                _editInvoice('name', `????n ${invoices.length}`)
              }}
            >
              <CloseCircleTwoTone style={{ cursor: 'pointer', marginLeft: 20, fontSize: 23 }} />
            </Popconfirm>
          </Row>
          <div style={{ marginTop: 15, display: !invoices[indexInvoice].isDelivery && 'none' }}>
            <Row style={{ fontSize: 16, fontWeight: 600 }} justify="space-between" align="middle">
              <div>?????a ch??? giao h??ng</div>
              <ModalDeliveryAddress
                editInvoice={_editInvoice}
                address={invoices[indexInvoice].deliveryAddress}
              />
            </Row>
            {invoices[indexInvoice].deliveryAddress && (
              <div style={{ fontSize: 15 }}>
                <div>
                  {`${invoices[indexInvoice].deliveryAddress.first_name} ${invoices[indexInvoice].deliveryAddress.last_name}`}{' '}
                  - {invoices[indexInvoice].deliveryAddress.phone}
                </div>
                <div>
                  {`${invoices[indexInvoice].deliveryAddress.address}, ${invoices[indexInvoice].deliveryAddress.district}, ${invoices[indexInvoice].deliveryAddress.province}`}
                </div>
              </div>
            )}
          </div>
          <Divider style={{ marginTop: 15, marginBottom: 15 }} />
          <Row justify="space-between" align="middle" wrap={false}>
            <div>
              <Switch
                checked={invoices[indexInvoice].isDelivery}
                style={{ marginRight: 10 }}
                onChange={(checked) => {
                  _editInvoice('isDelivery', checked)
                  _editInvoice('deliveryCharges', 0)
                  _editInvoice('billOfLadingCode', '')
                  _editInvoice('prepay', 0)
                  _editInvoice('moneyGivenByCustomer', 0)
                  _editInvoice('payments', [paymentMethodDefault])
                  _editInvoice('excessCash', 0)
                  _editInvoice('salesChannel', 'Chi nh??nh')
                }}
              />
              Giao h??ng t???n n??i
            </div>
            <div style={{ visibility: !invoices[indexInvoice].isDelivery && 'hidden' }}>
              K??nh:{' '}
              <Select
                allowClear
                style={{ width: 130, color: '#0977de' }}
                placeholder="Ch???n k??nh"
                bordered={false}
                value={invoices[indexInvoice].salesChannel || undefined}
                onChange={(value) => _editInvoice('salesChannel', value)}
              >
                <Select.Option value="Th????ng m???i ??i???n t???">Th????ng m???i ??i???n t???</Select.Option>
                <Select.Option value="Chi nh??nh">Chi nh??nh</Select.Option>
                <Select.Option value="M???ng X?? H???i">M???ng X?? H???i</Select.Option>
                <Select.Option value="other">Kh??c</Select.Option>
              </Select>
            </div>
          </Row>
          <Divider style={{ marginTop: 15, marginBottom: 15 }} />

          <Row wrap={false} justify="space-between" align="middle">
            <Radio
              checked={invoices[indexInvoice].type === 'default'}
              onClick={() => _editInvoice('type', 'default')}
            >
              T???o ho?? ????n
            </Radio>
            <Radio
              checked={invoices[indexInvoice].type === 'online'}
              onClick={() => _editInvoice('type', 'online')}
            >
              ?????t online
            </Radio>
            <ModalOrdersReturn />
          </Row>
          <div>
            <Row justify="space-between" wrap={false} align="middle" style={{ marginTop: 9 }}>
              <Row wrap={false} align="middle">
                <p>
                  T???ng ti???n (
                  <b>
                    {invoices[indexInvoice].order_details.reduce(
                      (total, current) => total + +current.quantity,
                      0
                    )}
                  </b>{' '}
                  s???n ph???m)
                </p>
              </Row>

              <p>{formatCash(invoices[indexInvoice].sumCostPaid)}</p>
            </Row>
            <Row justify="space-between" wrap={false} align="middle">
              <p>VAT</p>
              <p>{formatCash(invoices[indexInvoice].VAT || 0)}</p>
            </Row>
            <Row justify="space-between" wrap={false} align="middle">
              <p>
                Chi???t kh???u{' '}
                <ModalPromotion
                  invoiceCurrent={invoices[indexInvoice]}
                  editInvoice={_editInvoice}
                />
              </p>
              <p>
                {formatCash(
                  invoices[indexInvoice].discount ? invoices[indexInvoice].discount.value : 0
                )}{' '}
                {invoices[indexInvoice].discount
                  ? invoices[indexInvoice].discount.type === 'VALUE'
                    ? ''
                    : '%'
                  : ''}
              </p>
            </Row>

            <div style={{ display: !invoices[indexInvoice].isDelivery && 'none' }}>
              <Row justify="space-between" wrap={false} align="middle">
                <p>????n v??? v???n chuy???n</p>
                <div
                  style={{
                    borderBottom: '0.75px solid #C9C8C8',
                    minWidth: '50%',
                    marginBottom: 10,
                  }}
                >
                  <Select
                    value={invoices[indexInvoice].shipping?.shipping_company_id}
                    onChange={(value) => {
                      const shipping = shippingsMethod.find((s) => s.shipping_company_id == value)
                      if (shipping) _editInvoice('shipping', shipping)
                    }}
                    bordered={false}
                    style={{ width: '100%' }}
                    placeholder="Ch???n ????n v??? v???n chuy???n (n???u c??)"
                    optionFilterProp="children"
                    showSearch
                  >
                    {shippingsMethod.map((shipping, index) => (
                      <Select.Option value={shipping.shipping_company_id} index={index}>
                        {shipping.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Row>
              <Row justify="space-between" wrap={false} align="middle">
                <p>M?? v???n ????n</p>
                <div
                  style={{ borderBottom: '0.75px solid #C9C8C8', width: '50%', marginBottom: 10 }}
                >
                  <Input
                    onChange={(e) => _editInvoice('billOfLadingCode', e.target.value)}
                    value={invoices[indexInvoice].billOfLadingCode}
                    placeholder="Nh???p m?? v???n ????n (n???u c??)"
                    bordered={false}
                    style={{ width: '100%' }}
                  />
                </div>
              </Row>
              <Row justify="space-between" wrap={false} align="middle">
                <p style={{ marginTop: 10 }}>Ph?? giao h??ng</p>
                <div style={{ borderBottom: '0.75px solid #C9C8C8', width: '50%' }}>
                  <InputNumber
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    value={invoices[indexInvoice].deliveryCharges || ''}
                    onChange={(value) => _editInvoice('deliveryCharges', +value)}
                    placeholder="Nh???p ph?? giao h??ng"
                    defaultValue={''}
                    min={0}
                    bordered={false}
                    style={{ width: '100%' }}
                  />
                </div>
              </Row>
            </div>

            <Row
              justify="space-between"
              wrap={false}
              align="middle"
              style={{ fontWeight: 700, color: '#0877de', fontSize: 17, margin: '13px 0px' }}
            >
              <div>Kh??ch ph???i tr???</div>
              <div>{formatCash(invoices[indexInvoice].moneyToBePaidByCustomer)}</div>
            </Row>

            <Row justify="space-between" wrap={false} align="middle">
              <p style={{ marginBottom: 0 }}>Ti???n kh??ch ????a (F2)</p>
              {invoices[indexInvoice].payments.length === 1 ? (
                <div style={{ borderBottom: '0.75px solid #C9C8C8', width: '40%' }}>
                  <InputNumber
                    ref={inputRef}
                    value={
                      invoices[indexInvoice].isDelivery
                        ? invoices[indexInvoice].prepay
                        : invoices[indexInvoice].moneyGivenByCustomer
                    }
                    onChange={(value) => {
                      if (invoices[indexInvoice].isDelivery) _editInvoice('prepay', value)
                      else _editInvoice('moneyGivenByCustomer', value)
                      _editInvoice('payments', [
                        { method: invoices[indexInvoice].payments[0].method, value: value },
                      ])
                    }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    min={0}
                    bordered={false}
                    style={{ width: '100%' }}
                  />
                </div>
              ) : (
                formatCash(
                  invoices[indexInvoice].isDelivery
                    ? invoices[indexInvoice].prepay
                    : invoices[indexInvoice].moneyGivenByCustomer
                )
              )}
            </Row>

            <Row>
              <PaymentMethods
                setVisible={setVisiblePayments}
                visible={visiblePayments}
                moneyToBePaidByCustomer={invoices[indexInvoice].moneyToBePaidByCustomer}
                indexInvoice={indexInvoice}
                invoices={invoices}
                editInvoice={_editInvoice}
              />
            </Row>
            <div style={{ marginBottom: 10 }}>
              <Space size="middle">
                {invoices[indexInvoice].payments.map((payment) => (
                  <i style={{ color: '#637381' }}>
                    {payment.method} ({formatCash(payment.value || 0)})
                  </i>
                ))}
              </Space>
            </div>

            {/* <div
              style={{
                display: invoices[indexInvoice].payments.length !== 1 && 'none',
              }}
            >
              <Row style={{ marginTop: 20 }} justify="space-between" wrap={true}>
                {invoices[indexInvoice].moneyToBePaidByCustomer
                  ? TienThoi(+invoices[indexInvoice].moneyToBePaidByCustomer).map(
                      (price, index) => (
                        <Button
                          onClick={() => {
                            setChooseButtonPrice(price)
                            if (invoices[indexInvoice].isDelivery) _editInvoice('prepay', +price)
                            else _editInvoice('moneyGivenByCustomer', +price)
                          }}
                          type={chooseButtonPrice === price ? 'primary' : ''}
                          style={{ minWidth: 120, display: index > 5 && 'none', marginBottom: 15 }}
                        >
                          {formatCash(+price)}
                        </Button>
                      )
                    )
                  : ''}
              </Row>
            </div> */}
          </div>

          {!invoices[indexInvoice].isDelivery && (
            <Row wrap={false} justify="space-between" align="middle">
              <span>Ti???n th???a: </span>
              <span style={{ fontWeight: 600, color: 'red' }}>
                {formatCash(invoices[indexInvoice].excessCash)}
              </span>
            </Row>
          )}

          <div style={{ marginBottom: 60, marginTop: 10 }}>
            Ghi ch?? <EditOutlined />
            <NoteInvoice />
            {/* <div>
              <Checkbox ></Checkbox>
            </div> */}
          </div>

          <Row justify="center" align="middle" className={styles['sell-right__footer-btn']}>
            <Space>
              <ReactToPrint
                trigger={() => (
                  <Button
                    size="large"
                    type="primary"
                    style={{ width: 150, backgroundColor: '#EA9649', borderColor: '#EA9649' }}
                  >
                    In h??a ????n
                  </Button>
                )}
                content={() => printOrderRef.current}
              />
              <Button
                onClick={_validatedCreateOrderOrPay}
                size="large"
                type="primary"
                style={{
                  minWidth: 150,
                  backgroundColor: '#0877DE',
                  borderColor: '#0877DE',
                }}
              >
                {invoices[indexInvoice].isDelivery ? 'T???o ????n giao h??ng' : 'Thanh to??n'} (F1)
              </Button>
            </Space>
          </Row>
        </div>
      </div>
    </div>
  )
}
