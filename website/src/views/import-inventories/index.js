import React, { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import { formatCash } from 'utils'
import { FILTER_COL_HEIGHT, FILTER_SIZE, ROUTES } from 'consts'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import delay from 'delay'

//components
import columnsImportInventories from './columns'
import SettingColumns from 'components/setting-columns'
import exportToCSV from 'components/ExportCSV/export'
import ImportCSV from 'components/ImportCSV'
import TitlePage from 'components/title-page'
import PrintImportInventory from 'components/print/print-import-inventory'
import FilterDate from 'components/filter-date'

//antd
import {
  Row,
  Col,
  Space,
  Select,
  Table,
  Button,
  Modal,
  DatePicker,
  Popconfirm,
  notification,
  Input,
  Tooltip,
  Affix,
  Tag,
} from 'antd'

//icons
import {
  CopyOutlined,
  DeleteOutlined,
  PrinterOutlined,
  SearchOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons'

//apis
import {
  getOrdersImportInventory,
  uploadOrdersImportInventory,
  deleteOrderImportInventory,
  updateOrderImportInventory,
  getStatusOrderImportInventory,
} from 'apis/inventory'
import { getSuppliers } from 'apis/supplier'
import { getProducts } from 'apis/product'
import { getEmployees } from 'apis/employee'
import { getAllBranch } from 'apis/branch'

export default function ImportInventories() {
  let printOrderRef = useRef()
  const typingTimeoutRef = useRef(null)
  const history = useHistory()
  const branchIdApp = useSelector((state) => state.branch.branchId)
  const handlePrint = useReactToPrint({ content: () => printOrderRef.current })

  const [branchId, setBranchId] = useState()
  const [branches, setBranches] = useState([])
  const [employees, setEmployees] = useState([])
  const [statusList, setStatusList] = useState([])
  const [dataPrint, setDataPrint] = useState(null)
  const [ordersInventory, setOrdersInventory] = useState([])
  const [countOrder, setCountOrder] = useState(0)
  const [columns, setColumns] = useState([])

  const [loading, setLoading] = useState(false)

  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })

  const [fileTemplated, setFileTemplated] = useState([])
  const [valueSearch, setValueSearch] = useState('')
  const [supplierId, setSupplierId] = useState()
  const [productsSupplier, setProductsSupplier] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [visibleProductsToSupplier, setVisibleProductsToSupplier] = useState(false)
  const toggleProductsToSupplier = () => {
    setVisibleProductsToSupplier(!visibleProductsToSupplier)
    setProductsSupplier([])
    setSupplierId()
  }

  const Print = () => (
    <div style={{ display: 'none' }}>
      <PrintImportInventory ref={printOrderRef} data={dataPrint} />
    </div>
  )

  const onSearch = (e) => {
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

  const ModalDownloadProducts = ({ products }) => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)

    const columnsProduct = [
      {
        title: 'STT',
        render: (text, record, index) => index + 1,
      },
      {
        title: 'Tên',
        dataIndex: 'name',
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
      },
      {
        title: 'Số lượng nhập',
        render: (text, record) => record.quantity && formatCash(record.quantity || 0),
      },
      {
        title: 'Chiều rộng',
        dataIndex: 'width',
      },
      {
        title: 'Cân nặng',
        dataIndex: 'weight',
      },
      {
        title: 'Chiều dài',
        dataIndex: 'length',
      },
      {
        title: 'Chiều cao',
        dataIndex: 'height',
      },
      {
        title: 'Đơn vị',
        dataIndex: 'unit',
      },
      {
        title: 'Files',
        render: (text, record) => record.files.join(', '),
      },
      {
        title: 'Tags',
        render: (text, record) => record.tags.join(', '),
      },
      {
        title: 'Ngày tạo',
        render: (text, record) =>
          record.create_date && moment(record.create_date).format('DD-MM-YYYY HH:mm'),
      },
      {
        title: 'Mô tả',
        dataIndex: 'note',
      },
    ]

    return (
      <>
        <div style={{ color: '#6074E2', cursor: 'pointer' }} onClick={toggle}>
          Tải xuống
        </div>
        <Modal
          width="80%"
          footer={
            <Row justify="end">
              <Button
                type="primary"
                onClick={() => {
                  const dataExport = products.map((product, index) => ({
                    STT: index + 1,
                    Tên: product.name || '',
                    SKU: product.sku || '',
                    'Số lượng nhập': product.quantity && formatCash(product.quantity || 0),
                    'Chiều rộng': product.width || 0,
                    'Cân nặng': product.weight || 0,
                    'Chiều dài': product.length || 0,
                    'Chiều cao': product.height || 0,
                    'Đơn vị': product.unit || '',
                    Files: product.files.join(', '),
                    Tags: product.tags.join(', '),
                    'Ngày tạo':
                      product.create_date && moment(product.create_date).format('DD-MM-YYYY HH:mm'),
                    'Mô tả': product.description || '',
                  }))
                  exportToCSV(dataExport, 'Danh sách sản phẩm')
                }}
              >
                Tải xuống
              </Button>
            </Row>
          }
          title="Danh sách sản phẩm"
          onCancel={toggle}
          visible={visible}
          style={{ top: 20 }}
        >
          <Table
            dataSource={products}
            size="small"
            style={{ width: '100%' }}
            scroll={{ y: '60vh' }}
            pagination={false}
            columns={columnsProduct}
          />
        </Modal>
      </>
    )
  }

  const columnsProductsToSupplier = [
    {
      title: 'STT',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'product_name',
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'product_sku',
    },
    {
      title: 'Loại sản phẩm',
      dataIndex: 'categories',
    },
    {
      title: 'Mã phiên bản',
      dataIndex: 'sku',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
    },
    {
      title: 'Đơn giá nhập',
      dataIndex: 'import_price',
    },
    {
      title: 'Số lượng nhập',
      dataIndex: 'quantity',
    },
  ]

  const _onFilter = (attribute = '', value = '') => {
    const paramsFilterNew = { ...paramsFilter }
    if (value) paramsFilterNew[attribute] = value
    else delete paramsFilterNew[attribute]
    setParamsFilter({ ...paramsFilterNew })
  }

  const _getProductsToSupplier = async (supplierId) => {
    try {
      setLoading(true)
      const res = await getProducts({ merge: true, detach: true, supplier_id: supplierId })
      console.log(res)
      if (res.status === 200) {
        const productsSupplierNew = res.data.data.map((e) => ({
          ...e.variants,
          unit: e.unit || '',
          categories: e._categories && e._categories.map((category) => category.name).join(', '),
          product_sku: e.sku || '',
          product_name: e.name || '',
          import_price: e.variants.import_price_default || 0,
          quantity: e.variants.total_quantity,
          inventory_quantity: e.location && e.location[0] ? e.location[0].quantity : 0,
          sumCost: e.import_price_default || 0,
        }))

        setProductsSupplier([...productsSupplierNew])
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const _acceptOrderImportInventory = async (id) => {
    try {
      setLoading(true)
      const res = await updateOrderImportInventory({ status: 'COMPLETE' }, id)
      setLoading(false)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          _getOrdersImportInventory()
          notification.success({ message: 'Nhập hàng thành công!' })
        } else
          notification.error({
            message: res.data.message || 'Nhập hàng thất bại, vui lòng thử lại!',
          })
      } else
        notification.error({ message: res.data.message || 'Nhập hàng thất bại, vui lòng thử lại!' })
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _deleteOrderImportInventory = async (id) => {
    try {
      const res = await deleteOrderImportInventory(id)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          _getOrdersImportInventory()
          notification.success({ message: 'Xóa đơn nhập hàng thành công!' })
        } else
          notification.error({
            message: res.data.message || 'Xóa đơn nhập hàng thất bại, vui lòng thử lại!',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa đơn nhập hàng thất bại, vui lòng thử lại!',
        })
    } catch (error) {
      console.log(error)
    }
  }

  const _getOrdersImportInventory = async () => {
    try {
      setLoading(true)
      const res = await getOrdersImportInventory({ ...paramsFilter })
      console.log(res)
      if (res.status === 200) {
        setCountOrder(res.data.count)
        setOrdersInventory(res.data.data)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
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

  const _getEmployees = async () => {
    try {
      const res = await getEmployees()
      if (res.status === 200) setEmployees(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getBranches = async () => {
    try {
      const res = await getAllBranch()
      if (res.status === 200) setBranches(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getStatusOrderImportInventory = async () => {
    try {
      const res = await getStatusOrderImportInventory()
      console.log(res)
      if (res.status === 200) setStatusList(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const _getProducts = async () => {
    try {
      const res = await getProducts({
        branch: true,
        branch_id: branchIdApp,
        merge: true,
        detach: true,
      })
      if (res.status === 200) {
        if (res.data.data && res.data.data.length) {
          const data = res.data.data.filter((e, index) => index < 10)
          let productsExport = data.map((e, index) => ({
            STT: index + 1,
            'Mã phiếu nhập': 'PN0001',
            'Mã sản phẩm (*)': e.sku || '',
            'Mã phiên bản (*)': e.variants && (e.variants.sku || ''),
            'Giá nhập (*)': e.import_price_default || 0,
            // 'Tên nơi nhập (*)': '',
            'Số lượng nhập (*)': 0,
            // 'Ngày nhập hàng': '',
            // 'Chi phí dịch vụ': 0,
            // 'Thuế (VND)': 0,
            // 'Chiết khấu (VND)': 0,
            // 'Tổng cộng (VND)': 0,
            // 'Ghi chú': '',
          }))
          setFileTemplated(productsExport)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getSuppliers()
    _getProducts()
    _getEmployees()
    _getBranches()
    _getStatusOrderImportInventory()
  }, [])

  useEffect(() => {
    _getOrdersImportInventory()
  }, [paramsFilter, branchIdApp])

  return (
    <div className="card">
      <Print />
      <Affix offsetTop={60}>
        <TitlePage title="Nhập hàng">
          <Space>
            <Button
              size="large"
              onClick={() => setParamsFilter({ page: 1, page_size: 20 })}
              style={{ display: Object.keys(paramsFilter).length === 2 && 'none' }}
              danger
              type="primary"
            >
              Xóa bộ lọc
            </Button>
            <Button
              size="large"
              onClick={toggleProductsToSupplier}
              icon={<VerticalAlignTopOutlined />}
              style={{ backgroundColor: 'green', borderColor: 'green', color: 'white' }}
            >
              Xuất excel
            </Button>
            <Modal
              style={{ top: 20 }}
              footer={null}
              title="Xuất file excel sản phẩm từ nhà cung cấp"
              width="60%"
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
                    const dataExport = productsSupplier.map((record, index) => ({
                      STT: index + 1,
                      'Tên sản phẩm': record.product_name || '',
                      'Mã sản phẩm': record.product_sku || '',
                      'Loại sản phẩm': record.categories || '',
                      'Mã phiên bản': record.sku || '',
                      'Nhà cung cấp': record.supplier || '',
                      'Đơn vị': record.unit || '',
                      'Đơn giá nhập': record.import_price_default ? record.import_price_default : 0,
                      'Số lượng nhập': record.total_quantity || 0,
                    }))
                    exportToCSV(dataExport, 'Danh sách sản phẩm')
                  }}
                  type="primary"
                  style={{ display: !productsSupplier.length && 'none' }}
                >
                  Tải xuống
                </Button>
              </Row>
              <Table
                size="small"
                loading={loading}
                dataSource={productsSupplier}
                columns={columnsProductsToSupplier}
                pagination={false}
                style={{ width: '100%' }}
                scroll={{ y: 450 }}
              />
            </Modal>

            <ImportCSV
              reset={() => setBranchId()}
              keyForm={{ branch_id: branchId || '' }}
              size="large"
              txt="Nhập excel"
              upload={uploadOrdersImportInventory}
              reload={_getOrdersImportInventory}
              title={
                <Row wrap={false} align="middle">
                  <div style={{ marginRight: 20, fontWeight: 600 }}>Nhập hàng bằng file excel</div>

                  <div>
                    <div style={{ fontSize: 13 }}>Chọn chi nhánh</div>
                    <Select
                      showSearch
                      optionFilterProp="children"
                      value={branchId}
                      onChange={setBranchId}
                      placeholder="Chọn chi nhánh"
                      size="small"
                      style={{ width: 250 }}
                      allowClear
                    >
                      {branches.map((branch, index) => (
                        <Select.Option key={index} value={branch.branch_id}>
                          {branch.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </Row>
              }
              fileName="nhap_kho_mau"
              fileTemplated={
                fileTemplated.length
                  ? fileTemplated
                  : 'https://s3.ap-northeast-1.wasabisys.com/admin-order/2022/04/06/3a3da223-8140-4ca3-8d94-28492cf4a7bc/nhap_kho_mau.xlsx'
              }
              customFileTemplated={fileTemplated.length ? true : false}
            />
            <SettingColumns
              columns={columns}
              setColumns={setColumns}
              columnsDefault={columnsImportInventories}
              nameColumn="columnsImportInventories"
            />
            <Button
              size="large"
              type="primary"
              onClick={() => history.push(ROUTES.IMPORT_INVENTORY)}
            >
              Tạo đơn nhập hàng
            </Button>
          </Space>
        </TitlePage>
      </Affix>
      <div style={{ marginTop: 10 }}>
        <Row style={{ marginTop: '1rem', border: '1px solid #d9d9d9', borderRadius: 5 }}>
          {/* <Space wrap={true}> */}
          <Col xs={24} sm={24} md={6} lg={6} xl={6} style={{ height: FILTER_COL_HEIGHT }}>
            <Input
              allowClear
              style={{ width: '100%' }}
              size={FILTER_SIZE}
              value={valueSearch}
              onChange={onSearch}
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm theo số hóa đơn"
              bordered={false}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={4}
            lg={4}
            xl={4}
            style={{
              borderLeft: '1px solid #d9d9d9',
              borderRight: '1px solid #d9d9d9',
              height: FILTER_COL_HEIGHT,
            }}
          >
            <FilterDate paramsFilter={paramsFilter} setParamsFilter={setParamsFilter} />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={4}
            lg={4}
            xl={4}
            style={{ height: FILTER_COL_HEIGHT, borderRight: '1px solid #d9d9d9', width: '100%' }}
          >
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              showSearch
              optionFilterProp="children"
              size={FILTER_SIZE}
              bordered={false}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              value={paramsFilter.status}
              onChange={(value) => _onFilter('status', value)}
              style={{ width: '100%' }}
            >
              {statusList.map((status, index) => (
                <Select.Option value={status.name} index={index}>
                  {status.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={5} lg={5} xl={5} style={{ height: FILTER_COL_HEIGHT }}>
            <Select
              placeholder="Lọc theo người tạo đơn"
              allowClear
              showSearch
              size={FILTER_SIZE}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              bordered={false}
              style={{ borderRight: '1px solid #d9d9d9', width: '100%' }}
              value={paramsFilter.creator_id}
              onChange={(value) => _onFilter('creator_id', value)}
            >
              {employees.map((employee, index) => (
                <Select.Option key={index} value={employee.user_id}>
                  {employee.first_name} {employee.last_name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={5} md={5} lg={5} xl={5} style={{ height: FILTER_COL_HEIGHT }}>
            <Select
              placeholder="Lọc theo người xác nhận phiếu"
              allowClear
              showSearch
              size={FILTER_SIZE}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              bordered={false}
              style={{ width: '100%' }}
              value={paramsFilter.verifier_id}
              onChange={(value) => _onFilter('verifier_id', value)}
            >
              {employees.map((employee, index) => (
                <Select.Option
                  key={index}
                  value={employee.user_id}
                >{`${employee.first_name} ${employee.last_name}`}</Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: 15 }}>
        <Table
          loading={loading}
          size="small"
          scroll={{ y: 350 }}
          dataSource={ordersInventory}
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
                render: (text, record) => (
                  <a
                    onClick={() =>
                      history.push({ pathname: ROUTES.IMPORT_INVENTORY, state: record })
                    }
                  >
                    #{record.code}
                  </a>
                ),
              }
            if (column.key === 'location')
              return {
                ...column,
                render: (text, record) =>
                  record.import_location_info && record.import_location_info.name,
              }
            if (column.key === 'create_date')
              return {
                ...column,
                render: (text, record) =>
                  record.create_date && moment(record.create_date).format('DD-MM-YYYY HH:mm'),
              }
            if (column.key === 'final_cost')
              return {
                ...column,
                render: (text, record) => record.final_cost && formatCash(record.final_cost || 0),
              }
            if (column.key === 'payment_amount')
              return {
                ...column,
                render: (text, record) =>
                  record.payment_amount && formatCash(record.payment_amount || 0),
              }
            if (column.key === 'total_quantity')
              return {
                ...column,
                render: (text, record) =>
                  record.total_quantity && formatCash(record.total_quantity || 0),
              }
            if (column.key === 'location')
              return {
                ...column,
                render: (text, record) =>
                  record.import_location_info && record.import_location_info.name,
              }
            if (column.key === 'creator')
              return {
                ...column,
                render: (text, record) =>
                  record._order_creator &&
                  `${record._order_creator.first_name || ''} ${
                    record._order_creator.last_name || ''
                  }`,
              }
            if (column.key === 'verifier')
              return {
                ...column,
                render: (text, record) =>
                  record._receiver &&
                  `${record._receiver.first_name || ''} ${record._receiver.last_name || ''}`,
              }
            if (column.key === 'verify_date')
              return {
                ...column,
                render: (text, record) =>
                  record.verify_date && moment(record.verify_date).format('DD-MM-YYYY HH:mm'),
              }
            if (column.key === 'status')
              return {
                ...column,
                render: (text, record) => (
                  <Tag color={record.status === 'COMPLETE' && 'success'}>{record.status}</Tag>
                ),
              }
            if (column.key === 'action')
              return {
                ...column,
                render: (text, record) => (
                  <Space direction="vertical">
                    <Space>
                      <Tooltip title="Xóa phiếu nhập hàng">
                        <Popconfirm
                          onConfirm={() => _deleteOrderImportInventory(record.order_id)}
                          title="Bạn có muốn xóa đơn nhập hàng này không?"
                        >
                          <Button icon={<DeleteOutlined />} danger type="primary" />
                        </Popconfirm>
                      </Tooltip>
                      <Tooltip title="Nhập lại đơn này">
                        <Button
                          onClick={() =>
                            history.push(`${ROUTES.IMPORT_INVENTORY}?order_id=${record.order_id}`)
                          }
                          icon={<CopyOutlined />}
                          type="primary"
                        />
                      </Tooltip>
                      <Tooltip title="In hóa đơn">
                        <Button
                          onClick={async () => {
                            setDataPrint(record)
                            await delay(100)
                            handlePrint()
                          }}
                          icon={<PrinterOutlined />}
                          type="primary"
                        />
                      </Tooltip>
                    </Space>
                    {record.status !== 'COMPLETE' && (
                      <Popconfirm
                        onConfirm={() => _acceptOrderImportInventory(record.order_id)}
                        okText="Đồng ý"
                        cancelText="Từ chối"
                        title="Bạn có muốn nhập đơn hàng này không?"
                      >
                        <Button type="primary">Nhập hàng</Button>
                      </Popconfirm>
                    )}
                  </Space>
                ),
              }
            if (column.key === 'products')
              return {
                ...column,
                render: (text, record) => (
                  <ModalDownloadProducts
                    products={
                      record.products
                        ? record.products.map(
                            (e) =>
                              e && {
                                ...e.product_info,
                                quantity: e.quantity,
                                files: record.files,
                                tags: record.tags,
                                note: record.note,
                              }
                          )
                        : []
                    }
                  />
                ),
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
            onChange: (page, pageSize) =>
              setParamsFilter({ ...paramsFilter, page: page, page_size: pageSize }),
            total: countOrder,
          }}
        />
      </div>
    </div>
  )
}
