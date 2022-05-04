import React, { useEffect, useState } from 'react'
import styles from './overview.module.scss'
import { LineChart } from 'react-chartkick'
import { formatCash } from 'utils'
import { useSelector } from 'react-redux'
import noData from 'assets/icons/no-data.png'

//antd
import { Row, Col, Skeleton, DatePicker, Checkbox } from 'antd'

//icons antd
import { ShoppingCartOutlined, InfoCircleOutlined } from '@ant-design/icons'

//apis
import { getStatistical, getStatisticalChart, getStatisticalProduct } from 'apis/statis'
import moment from 'moment'
import { IMAGE_DEFAULT } from 'consts'

const Overview = () => {


  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [statisticalProduct, setStatisticalProduct] = useState({})
  const [statisticalToday, setStatisticalToday] = useState({})
  const [statisticalChart, setStatisticalChart] = useState([])
  const [monthChart, setMonthChart] = useState(moment())

  const [allBranch, setAllBranch] = useState(false)
  const [loadingSkeleton, setLoadingSkeleton] = useState(false)
  const [loadingSkeletonChart, setLoadingSkeletonChart] = useState(false)
  const [loadingSkeletonProduct, setLoadingSkeletonProduct] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const SALES = ['Tổng đơn hàng', 'Tổng giá vốn', 'Tổng doanh thu', 'Tổng lợi nhuận']

  function onChange(date, dateString) {
    console.log(date)
    setMonthChart(moment(date).format('YYYY-MM'))
  }

  const checkBranch = () => {
    if (allBranch === true) {
      return
    } else {
      return branchIdApp
    }

  }

  const _getStatistical = async () => {
    try {
      setLoadingSkeleton(true)
      const resToday = await getStatistical({ branch_id: checkBranch() })
      if (resToday.status === 200) setStatisticalToday(resToday.data.data)
      setLoadingSkeleton(false)
    } catch (e) {
      setLoadingSkeleton(false)
      console.log(e)
    }
  }
  const _getStatisticalChart = async () => {
    try {
      setLoadingSkeletonChart(true)
      const resChart = await getStatisticalChart({
        branch_id: checkBranch(),
        from_date: moment(monthChart).startOf('months').format(),
        to_date: moment(monthChart).endOf('months').format(),
      })
      console.log(resChart)
      if (resChart.status === 200) {
        setStatisticalChart(resChart.data.data)
      }
      setLoadingSkeletonChart(false)
    } catch (e) {
      setLoadingSkeletonChart(false)
      console.log(e)
    }
  }
  const _getStatisticalProduct = async () => {
    try {
      setLoadingSkeletonProduct(true)
      const resProduct = await getStatisticalProduct()
      if (resProduct.status === 200) setStatisticalProduct(resProduct.data.data)
      setLoadingSkeletonProduct(false)
    } catch (e) {
      setLoadingSkeletonProduct(false)
      console.log(e)
    }
  }

  useEffect(() => {
    _getStatistical()
    _getStatisticalChart()
    _getStatisticalProduct()
  }, [branchIdApp, allBranch])

  useEffect(() => {
    _getStatisticalChart()
  }, [monthChart])

  //get width device
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true)
    } else setIsMobile(false)
  }, [])

  return (
    <div>
      {loadingSkeleton ? (
        <Skeleton active paragraph={{ rows: 9 }} />
      ) : (
        <div className={styles['card-overview']}>
          <div className={styles['dashboard_manager_balance_title']}>
            <div>DOANH SỐ BÁN HÀNG HÔM NAY ({moment(new Date()).format('DD/MM/YYYY')})</div>
            <Checkbox checked={allBranch} onChange={(e) => setAllBranch(e.target.checked)}> <b>Tất cả chi nhánh</b> </Checkbox>
          </div>
          <Row justify="space-between" style={{ width: '100%' }}>
            {SALES.map((e, index) => (
              <div
                style={{
                  width: '50%',
                  padding: 10,
                  borderRight: (index === 0 || index === 2) && '1px solid gray',
                  borderBottom: (index === 0 || index === 1) && '1px solid gray',
                }}
              >
                <Row justify="space-between" wrap={false} style={{ fontWeight: 600, fontSize: 18 }}>
                  <div>
                    <ShoppingCartOutlined /> {e}
                  </div>
                  <InfoCircleOutlined />
                </Row>
                <span style={{ marginBottom: 0, fontWeight: 700, fontSize: 17, color: '#5B6BE8' }}>
                  {e.name === 'Tổng đơn hàng'
                    ? formatCash(statisticalToday?.total_order)
                    : e.name === 'Tổng giá vốn'
                      ? formatCash(statisticalToday?.total_base_price)
                      : e.name === 'Tổng doanh thu'
                        ? formatCash(statisticalToday?.total_revenue)
                        : formatCash(statisticalToday?.total_profit)}
                </span>
              </div>
            ))}
          </Row>
        </div>
      )}

      <Row>
        {loadingSkeletonChart ? (
          <Skeleton active paragraph={{ rows: 9 }} />
        ) : (
          <Col xs={24} sm={24} md={24} lg={14} xl={14}>
            <div
              style={{ marginRight: !isMobile && 7, marginTop: 0, height: 400, marginBottom: 15 }}
              className={styles['card-overview']}
            >
              <div className={styles['dashboard_manager_revenue_title']}>
                <Row align="middle">Biểu đồ doanh thu tháng {moment(monthChart).format('MM')}
                  {/* {new Date().getMonth() + 1} */}
                  <DatePicker onChange={onChange} picker="month" bordered={false} placeholder='Chọn tháng' format={'MM-YYYY'} />
                </Row>
              </div>
              <div>
                <LineChart data={statisticalChart.map(e => e)} />
              </div>
            </div>
          </Col>
        )}

        {loadingSkeletonProduct ? (
          <Skeleton active paragraph={{ rows: 9 }} style={{ marginBottom: 15 }} />
        ) : (
          <Col xs={24} sm={24} md={24} lg={10} xl={10} style={{ marginBottom: isMobile && 15 }}>
            <div
              style={{
                marginLeft: !isMobile ? 7 : 0,
                marginTop: 0,
                height: 400,
                marginBottom: 15,
              }}
              className={styles['card-overview']}
            >
              <div className={styles['dashboard_manager_bottom_row_col_parent_top']}>
                <div>Top 10 sản phẩm bán chạy</div>
              </div>
              <div style={{ width: '100%', overflowY: 'scroll', paddingTop: 10 }}>
                {
                  statisticalProduct.length ? (
                    statisticalProduct.slice(0, 10).map((e, index) => {
                      return (
                        <Row
                          align="middle"
                          style={
                            index % 2
                              ? { marginBottom: 8, background: '#F7F8FA' }
                              : { marginBottom: 8 }
                          }
                        >
                          <Col span={5}>
                            <img
                              alt=""
                              src={e.product_info.images && e.product_info.images.length ? e.product_info.images[0] : IMAGE_DEFAULT}
                              width="50px"
                            />
                          </Col>
                          <Col span={12}>
                            <Row>{e.product_info.name || ''}</Row>
                            <Row style={{ fontWeight: 500 }}>Đã bán {e.product_info.sale_quantity} sản phẩm</Row>
                          </Col>
                        </Row>
                      )
                    })
                  )
                    : (
                      <div style={{ textAlign: 'center' }}>
                        <img src={noData} alt="" style={{ width: 90, height: 90 }} />
                        <h4 style={{ fontSize: 15, color: '#555' }}>Chưa có sản phẩm bán chạy</h4>
                      </div>
                    )
                }
              </div>
            </div>
          </Col>
        )}
      </Row>
    </div>
  )
}
export default Overview
