import React, { useState, useEffect } from 'react'
import { ToTopOutlined } from '@ant-design/icons'
import { Button } from 'antd'

import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'

//apis
import { getCategories } from 'apis/category'
import { getSuppliers } from 'apis/supplier'

export default function ExportProduct({ fileName, name, getProductsExport }) {
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])

  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const exportToCSV = (csvData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(csvData)
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, fileName + fileExtension)
  }

  const _getSuppliers = async () => {
    try {
      const res = await getSuppliers()
      if (res.status === 200) {
        setSuppliers(res.data.data)
      }
    } catch (error) {}
  }

  const _getCategories = async () => {
    try {
      const res = await getCategories()
      if (res.status === 200) {
        setCategories(res.data.data)
      }
    } catch (error) {}
  }

  useEffect(() => {
    _getCategories()
    _getSuppliers()
  }, [])

  return (
    <Button
      onClick={async () => {
        const data = await getProductsExport()
        let dataExport = []

        data.map((e) => {
          const findCategory = categories.find((c) => c.category_id === e.category_id)

          const findSupplier = suppliers.find((s) => s.supplier_id === e.supplier_id)

          let objProduct = {
            'Tên sản phẩm': e.name || '',
            'Mã sản phẩm': e.sku || '',
            'Loại sản phẩm': findCategory ? findCategory.name : '',
            'Nhà cung cấp': findSupplier ? findSupplier.name : '',
            'Chiều dài': e.length,
            'Chiều rộng': e.width,
            'Chiều cao': e.height,
            'Cân nặng': e.weight,
            'Đơn vị': e.unit,
            Thuế: 'Có',
            'Bảo hành': e.waranties && e.waranties.length ? 'Có' : 'Không',
            'Thương hiệu': '',
            'Xuất xứ': '',
            'Tình trạng': 'Mới',
            'Mô tả': e.description,
            'Trạng thái': e.active ? 'Mở bán' : 'Ngừng bán',
          }
          e.attributes.map(
            (attribute, index) => (objProduct[`Thuộc tính ${index + 1}`] = attribute.option)
          )

          e.variants.map((v) => {
            let locationImport = {}
            v.locations.map((k) => {
              locationImport['Nơi nhập'] = k.type
              locationImport['Tên nơi nhập'] = k.name
              locationImport['Số lượng nhập'] = k.quantity
            })

            dataExport.push({
              ...objProduct,
              'Tên phiên bản': v.title || '',
              'Mã phiên bản': v.sku || '',
              'Hình ảnh': v.image.join(', '),
              'Giá nhập hàng': v.import_price || '',
              'Giá vốn': v.base_price || '',
              'Giá bán lẻ': v.sale_price || '',
              'Giá bán sỉ': '',
              'Số lượng sỉ': v.total_quantity || '',
              'Số địa điểm nhập': v.locations.length || 0,
              ...locationImport,
            })
          })
        })

        exportToCSV(dataExport, fileName)
      }}
      icon={<ToTopOutlined />}
      size="large"
      type="primary"
      style={{ minWidth: 130 }}
    >
      {name}
    </Button>
  )
}
