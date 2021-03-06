import React, { useEffect, useState } from 'react'
import styles from './point.module.scss'
import { useDispatch } from 'react-redux'
import { ROUTES } from 'consts'
import { useHistory } from 'react-router-dom'

//components
import TitlePage from 'components/title-page'

//antd
import {
  Row,
  Col,
  Select,
  Checkbox,
  Radio,
  InputNumber,
  Input,
  Button,
  Space,
  notification,
  Tooltip,
} from 'antd'

//icons
import { ArrowLeftOutlined } from '@ant-design/icons'

//apis
import { getPoint, updatePoint } from 'apis/point'
import { getAllBranch } from 'apis/branch'
import { getProducts } from 'apis/product'
import { getCategories } from 'apis/category'
import { getCustomerTypes } from 'apis/customer'

export default function Point() {
  const dispatch = useDispatch()
  const history = useHistory()

  const [loading, setLoading] = useState(false)
  const [point, setPoint] = useState({})
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState(1)
  const [dataProduct, setDataProduct] = useState([])
  const [dataCategories, setDataCategories] = useState([])
  const [customerTypes, setCustomerTypes] = useState([])

  const [config, setConfig] = useState({
    active: true,
    accumulate_for_promotion_product: false,
    accumulate_for_refund_order: false,
    accumulate_for_payment_point: false,
    accumulate_for_fee_shipping: false,
    stack_point: false,
    exchange_point_rate: 0,
    exchange_money_rate: 0,
    order_require: 0,
    order_cost_require: 0,
    all_branch: false,
    branch_id: [],
    all_customer_type: false,
    customer_type_id: [],
    all_category: false,
    category_id: [],
    all_product: false,
    product_id: [],
  })
  const [orderPoint, setOrderPoint] = useState({
    order_require: config.order_require === false ? 0 : config.order_require,
    order_require_check:
      config.order_require === false ? false : config.order_require !== false && true,
  })
  // console.log(orderPoint)

  const PointTitle = ({ title }) => (
    <Row style={{ borderBottom: 'solid 1px #B4B4B4', paddingBottom: '10px' }}>
      <Col>
        <Row align="middle" style={{ fontSize: 18, fontWeight: 600 }}>
          {title}
        </Row>
      </Col>
    </Row>
  )

  const onSaveSetting = async () => {
    try {
      dispatch({ type: 'LOADING', data: true })
      const data = {
        active: config.active,
        accumulate_for_promotion_product: config.accumulate_for_promotion_product,
        accumulate_for_refund_order: config.accumulate_for_refund_order,
        accumulate_for_payment_point: config.accumulate_for_payment_point,
        accumulate_for_fee_shipping: config.accumulate_for_fee_shipping,
        stack_point: config.stack_point,
        exchange_point_rate: config.exchange_point_rate,
        exchange_money_rate: config.exchange_money_rate,
        order_require: orderPoint.order_require_check === true ? orderPoint.order_require : false,
        order_cost_require: config.order_cost_require,
        all_branch: config.all_branch,
        branch_id: config.all_branch === false ? config.branch_id : [],
        all_customer_type: config.all_customer_type,
        customer_type_id: config.all_customer_type === false ? config.customer_type_id : [],
        all_category: config.all_category,
        category_id: config.all_category === false ? config.category_id : [],
        all_product: config.all_product,
        product_id: config.all_product === false ? config.product_id : [],
      }
      console.log(data)
      if (
        (data.all_branch === false && data.branch_id.length === 0) ||
        (data.all_customer_type === false && data.customer_type_id.length === 0) ||
        (data.all_category === false && data.category_id.length === 0) ||
        (data.all_product === false && data.product_id.length === 0)
      ) {
        notification.error({
          message: 'C???u h??nh t??ch ??i???m th???t b???i, vui l??ng ??i???n ?????y ????? th??ng tin',
        })
      } else {
        const res = await updatePoint(data)
        if (res.status === 200) {
          if (res.data.success) {
            notification.success({ message: 'C???u h??nh t??ch ??i???m th??nh c??ng' })
          } else {
            notification.error({
              message: res.data.message || 'C???u h??nh t??ch ??i???m th???t b???i, vui l??ng th??? l???i',
            })
          }
        } else {
          notification.error({
            message: res.data.message || 'C???u h??nh t??ch ??i???m th???t b???i, vui l??ng th??? l???i',
          })
        }
      }
      dispatch({ type: 'LOADING', data: false })
    } catch (err) {
      console.log(err)
      dispatch({ type: 'LOADING', data: true })
      // notification.error({ message: 'C???p nh???t th???t b???i' })
    }
  }

  const selectAllBranch = (checked) => {
    if (checked) setConfig({ ...config, selected: branches.map((e) => e.branch_id) })
    else setConfig({ ...config, selected: [] })
  }

  const _getPoint = async () => {
    try {
      setLoading(true)
      const res = await getPoint()
      if (res.data.success) {
        if (res.data.data && res.data.data.length) setPoint(res.data.data[0])
      }
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const _getBranches = async (params) => {
    try {
      setLoading(true)
      const res = await getAllBranch(params)
      if (res.data.success) {
        setBranches(res.data.data)
        if (res.data.data && res.data.data.length) {
          setSelectedBranch(res.data.data[0].branch_id)
        }
      }
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const _getProducts = async (params) => {
    try {
      setLoading(true)
      const res = await getProducts(params)
      if (res.status === 200) setDataProduct(res.data.data)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const _getCategories = async (params) => {
    try {
      setLoading(true)
      const res = await getCategories(params)
      if (res.status === 200) setDataCategories(res.data.data)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const _getCustomerTypes = async (params) => {
    try {
      setLoading(true)
      const res = await getCustomerTypes(params)
      if (res.status === 200) setCustomerTypes(res.data.data)
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    _getPoint()
    _getBranches()
    _getProducts()
    _getCategories()
    _getCustomerTypes()
  }, [])

  // useEffect(() => {
  //   setOrderPoint({
  //     order_require: config.order_require === false ? 0 : config.order_require,
  //     order_require_check: config.order_require === false ? false : true
  //   })
  // }, [config])

  useEffect(() => {
    setConfig({
      active: point.active,
      accumulate_for_promotion_product: point.accumulate_for_promotion_product,
      accumulate_for_refund_order: point.accumulate_for_refund_order,
      accumulate_for_payment_point: point.accumulate_for_payment_point,
      accumulate_for_fee_shipping: point.accumulate_for_fee_shipping,
      stack_point: point.stack_point,
      exchange_point_rate: point.exchange_point_rate,
      exchange_money_rate: point.exchange_money_rate,
      order_require: point.order_require,
      order_cost_require: point.order_cost_require,
      all_branch: point.all_branch,
      branch_id: point.branch_id,
      all_customer_type: point.all_customer_type,
      customer_type_id: point.customer_type_id,
      all_category: point.all_category,
      category_id: point.category_id,
      all_product: point.all_product,
      product_id: point.product_id,
    })
  }, [point])

  return (
    <div className={styles['point-container']}>
      <TitlePage
        title={
          <Row
            wrap={false}
            align="middle"
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(ROUTES.CONFIGURATION_STORE)}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            C???u h??nh t??ch ??i???m
          </Row>
        }
      >
        <Button type="primary" size="large" style={{ width: 100 }} onClick={onSaveSetting}>
          L??u
        </Button>
      </TitlePage>

      <Row justify="space-between" className={styles['point-top']}>
        <Col md={6} lg={6} xl={6}>
          <h3>Thi???t l???p c?? b???n</h3>
          <p>Nh???ng thi???t l???p chung nh???t cho vi???c s??? d???ng t??nh n??ng tr??n ph???n m???m.</p>
        </Col>
        <Col md={16} lg={16} xl={16} className={styles['point-top-right']}>
          <Row className={styles['point-top-right-top']}>
            <Checkbox
              checked={config.active}
              onChange={(e) =>
                setConfig({
                  ...config,
                  active: e.target.checked,
                })
              }
            >
              <span style={{ fontWeight: 500 }}>??p d???ng t??nh n??ng t??ch ??i???m</span>
            </Checkbox>
          </Row>

          <Row className={styles['point-top-right-middle-1']}>
            <h4>C?? CH??? T??CH ??I???M</h4>
            <Checkbox
              checked={config.accumulate_for_promotion_product}
              onChange={(e) =>
                setConfig({
                  ...config,
                  accumulate_for_promotion_product: e.target.checked,
                })
              }
            >
              T??ch ??i???m cho c??c s???n ph???m gi???m gi??
            </Checkbox>
            <Checkbox
              checked={config.accumulate_for_refund_order}
              onChange={(e) =>
                setConfig({
                  ...config,
                  accumulate_for_refund_order: e.target.checked,
                })
              }
            >
              T??ch ??i???m khi kh??ch h??ng tr??? h??ng
            </Checkbox>
          </Row>

          <Row className={styles['point-top-right-middle-2']}>
            <h4>H??NH TH???C T??CH ??I???M</h4>
            <Radio.Group
              onChange={(e) => setConfig({ ...config, stack_point: e.target.value })}
              value={config.stack_point}
            >
              <Radio value={false}>T??ch ??i???m c??? ?????nh</Radio>
              <Radio value={true}>T??ch ??i???m l??y ti???n - c???ng d???n</Radio>
            </Radio.Group>
          </Row>

          <Row className={styles['point-top-right-bottom']}>
            <h4>T??? L??? QUY ?????I ??I???M</h4>
            <Row>
              <Col span={10}>
                <InputNumber
                  value={config.exchange_point_rate}
                  onChange={(e) => setConfig({ ...config, exchange_point_rate: e })}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />{' '}
                = 1 ??i???m
              </Col>
              <Col span={14}>
                ????n v??? t??ch ??i???m <Input defaultValue="??i???m" readOnly style={{ width: '15%' }} />
              </Col>
            </Row>
          </Row>
        </Col>
      </Row>

      <Row justify="space-between" className={styles['point-bottom']}>
        <Col md={6} lg={6} xl={6}>
          <h3>Thi???t l???p n??ng cao</h3>
          <p>Nh???ng thi???t l???p li??n quan ?????n thanh to??n v?? ?????i t?????ng ???????c ??p d???ng.</p>
        </Col>
        <Col md={16} lg={16} xl={16} className={styles['point-bottom-right']}>
          <Row className={styles['point-bottom-right-payment']}>
            <h4>THANH TO??N</h4>
            <p>T??? l??? quy ??i???m ra ti???n</p>
            <div>
              1 ??i???m ={' '}
              <InputNumber
                value={config.exchange_money_rate}
                onChange={(e) => setConfig({ ...config, exchange_money_rate: e })}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </div>
            <div className={styles['format-display']}>
              <div>
                <Checkbox
                  checked={orderPoint.order_require_check}
                  onChange={(e) =>
                    setOrderPoint({
                      order_require_check: e.target.checked,
                    })
                  }
                >
                  Cho ph??p thanh to??n b???ng ??i???m sau
                </Checkbox>
                <InputNumber
                  disabled={!orderPoint.order_require_check}
                  onChange={(e) =>
                    setOrderPoint({
                      // ...config,
                      ...orderPoint,
                      order_require: e,
                    })
                  }
                  value={orderPoint.order_require || config.order_require}
                  min={1}
                  style={{ width: '15%' }}
                />{' '}
                l???n mua
              </div>
              <Checkbox
                checked={config.accumulate_for_payment_point}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    accumulate_for_payment_point: e.target.checked,
                  })
                }
              >
                T??ch ??i???m khi kh??ch h??ng thanh to??n h??a ????n b???ng ??i???m
              </Checkbox>
              <Checkbox
                checked={config.accumulate_for_fee_shipping}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    accumulate_for_fee_shipping: e.target.checked,
                  })
                }
              >
                T??ch ??i???m cho gi?? tr??? thanh to??n bao g???m ph?? v???n chuy???n
              </Checkbox>
            </div>
          </Row>

          <Row className={styles['point-bottom-right-content']}>
            <h4>KH??CH H??NG ??P D???NG T??CH ??I???M</h4>
            <Radio.Group
              className={styles['point-bottom-right-radio']}
              onChange={(e) => setConfig({ ...config, all_customer_type: e.target.value })}
              value={config.all_customer_type}
            >
              <Radio value={true}>T???t c??? kh??ch h??ng</Radio>
              <Radio value={false}>Theo nh??m kh??ch h??ng</Radio>
            </Radio.Group>
            <Row>
              <Select
                mode="multiple"
                placeholder="Ch???n lo???i kh??ch h??ng"
                size="small"
                value={config.customer_type_id}
                onChange={(e) => setConfig({ ...config, customer_type_id: e })}
                style={{
                  display: `${config.all_customer_type === false ? 'block' : 'none'}`,
                  width: '50%',
                  marginTop: 10,
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  // console.log(input, option)
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                // filterSort={(optionA, optionB) => {
                //   if (optionA.children !== undefined && optionB.children !== undefined) {
                //     optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                //   } else {
                //     return ''
                //   }
                // }}
              >
                {customerTypes.length !== 0
                  ? customerTypes.map((type, index) => (
                      <Select.Option value={type.type_id} key={index}>
                        {type.name}
                      </Select.Option>
                    ))
                  : ''}
              </Select>
            </Row>
          </Row>

          <Row className={styles['point-bottom-right-content']}>
            <h4>DANH S??CH S???N PH???M ??P D???NG T??CH ??I???M</h4>
            <Radio.Group
              className={styles['point-bottom-right-radio']}
              onChange={(e) => setConfig({ ...config, all_category: e.target.value })}
              value={config.all_category}
            >
              <Radio value={true}>T???t c??? s???n ph???m</Radio>
              <Radio value={false}>Theo lo???i s???n ph???m</Radio>
            </Radio.Group>
            <Row>
              <Select
                mode="multiple"
                placeholder="Ch???n nh??m s???n ph???m"
                size="small"
                value={config.category_id}
                onChange={(e) => setConfig({ ...config, category_id: e })}
                style={{
                  display: `${config.all_category === false ? 'block' : 'none'}`,
                  width: '50%',
                  marginTop: 10,
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                // filterSort={(optionA, optionB) => {
                //   if (optionA.children !== undefined && optionB.children !== undefined) {
                //     optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                //   } else {
                //     return ''
                //   }
                // }}
              >
                {dataCategories.length !== 0
                  ? dataCategories.map((e) => (
                      <Select.Option value={e.category_id}>{e.name}</Select.Option>
                    ))
                  : ''}
              </Select>
            </Row>
          </Row>

          <Row className={styles['point-bottom-right-content']}>
            <h4>S???N PH???M ??P D???NG T??CH ??I???M</h4>
            <Radio.Group
              className={styles['point-bottom-right-radio']}
              onChange={(e) => setConfig({ ...config, all_product: e.target.value })}
              value={config.all_product}
            >
              <Radio value={true}>T???t c??? s???n ph???m</Radio>
              <Radio value={false}>Theo s???n ph???m</Radio>
            </Radio.Group>
            <Row>
              <Select
                mode="multiple"
                placeholder="Ch???n s???n ph???m"
                size="small"
                value={config.product_id}
                onChange={(e) => setConfig({ ...config, product_id: e })}
                style={{
                  display: `${config.all_product === false ? 'block' : 'none'}`,
                  width: '50%',
                  marginTop: 10,
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                // filterSort={(optionA, optionB) => {
                //   if (optionA.children !== undefined && optionB.children !== undefined) {
                //     optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                //   } else {
                //     return ''
                //   }
                // }}
              >
                {dataProduct.length !== 0
                  ? dataProduct.map((e) => (
                      <Select.Option value={e.product_id}>{e.name}</Select.Option>
                    ))
                  : ''}
              </Select>
            </Row>
          </Row>

          <Row className={styles['point-bottom-right-content']}>
            <h4>CHI NH??NH ??P D???NG T??CH ??I???M</h4>
            <Radio.Group
              className={styles['point-bottom-right-radio']}
              onChange={(e) => setConfig({ ...config, all_branch: e.target.value })}
              value={config.all_branch}
            >
              <Radio value={true}>T???t c??? chi nh??nh</Radio>
              <Radio value={false}>Theo t???ng chi nh??nh</Radio>
            </Radio.Group>
            <Row>
              <Select
                mode="multiple"
                placeholder="Ch???n chi nh??nh"
                size="small"
                value={config.branch_id}
                onChange={(e) => setConfig({ ...config, branch_id: e })}
                style={{
                  display: `${config.all_branch === false ? 'block' : 'none'}`,
                  width: '50%',
                  marginTop: 10,
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                // filterSort={(optionA, optionB) => {
                //   if (optionA.children !== undefined && optionB.children !== undefined) {
                //     optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                //   } else {
                //     return ''
                //   }
                // }}
              >
                {branches.map((e) => (
                  <Select.Option value={e.branch_id}>{e.name}</Select.Option>
                ))}
              </Select>
            </Row>
          </Row>

          {/* <Row className={styles['point-bottom-right-content']}>
            <h4>NGU???N ????N H??NG ??P D???NG T??CH ??I???M</h4>
            <Radio.Group>
              <Radio>T???t c??? c??c ngu???n</Radio>
              <Radio>Theo t???ng ngu???n ????n h??ng</Radio>
            </Radio.Group>
          </Row>

          <Row className={styles['point-bottom-right-content']}>
            <h4>DANH S??CH S???N PH???M ??P D???NG ?????I QU??</h4>
            <Radio.Group>
              <Radio>T???t c??? c??c s???n ph???m</Radio>
              <Radio>Theo lo???i s???n ph???m</Radio>
            </Radio.Group>
          </Row> */}
        </Col>
      </Row>

      {/* <Row style={{ margin: '1em 0' }}>
        <Col xs={24} lg={8}>
          <Select
            mode="multiple"
            placeholder="Ch???n chi nh??nh"
            size="large"
            value={config.branch_id}
            // onChange={(e) => setConfig({ ...config, branch_id: e })}
            style={{ width: '100%' }}
          >
            {branches.map((e) => (
              <Select.Option value={e.branch_id}>{e.name}</Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row style={{ margin: '1em 0' }}>
        <Checkbox
        // onChange={(e) => selectAllBranch(e.target.checked)}
        >
          ??p d???ng cho t???t c??? chi nh??nh
        </Checkbox>
      </Row>
      <Row gutter={30} style={{ margin: '1em 0' }}>
        <Col xs={24} lg={12}>
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <PointTitle title="Thi???t l???p t??ch ??i???m" />
              <Checkbox
                checked={config.accumulate}
              // onChange={(e) =>
              //   setConfig({
              //     ...config,
              //     accumulate: e.target.checked,
              //   })
              // }
              >
                <span style={{ fontWeight: 500, color: 'blue' }}>??p d???ng t??nh n??ng t??ch ??i???m</span>
              </Checkbox>
              <div>
                <b>C?? ch??? t??ch ??i???m</b>
              </div>
              <Checkbox checked={config.accumulate}>T??ch ??i???m cho to??n b??? s???n ph???m</Checkbox>
              <div>
                <b>H??nh th???c t??ch ??i???m</b>
              </div>
              <Radio.Group>
                <Radio>T??ch ??i???m c??? ?????nh</Radio>
              </Radio.Group>
              <div>
                <b>T??? l??? quy ?????i ??i???m</b>
              </div>
              <div>
                <InputNumber
                  value={config.accumulate_price}
                  // onChange={(e) => setConfig({ ...config, accumulate_price: e })}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />{' '}
                = 1 ??i???m
              </div>
            </Space>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <PointTitle title="Thi???t l???p ?????i ??i???m" />
              <Checkbox
                checked={config.use}
              // onChange={(e) =>
              //   setConfig({
              //     ...config,
              //     use: e.target.checked,
              //   })
              // }
              >
                <span style={{ fontWeight: 500, color: 'blue' }}>??p d???ng t??nh n??ng ?????i ??i???m</span>
              </Checkbox>
              <div>
                <b>Thanh to??n</b>
              </div>
              <div>T??? l??? quy ?????i ??i???m ra ti???n</div>
              <div>
                1 ??i???m ={' '}
                <InputNumber
                  value={config.use_price}
                  // onChange={(e) => setConfig({ ...config, use_price: e })}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </div>
            </Space>
          </div>
        </Col>
      </Row> */}
    </div>
  )
}
