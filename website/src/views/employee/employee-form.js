// import React, { useEffect, useState } from 'react'
// import moment from 'moment'
// import { useSelector } from 'react-redux'
// import { validatePhone } from 'utils'

// //antd
// import {
//   Form,
//   Drawer,
//   Row,
//   Col,
//   Button,
//   Input,
//   notification,
//   DatePicker,
//   Select,
//   Radio,
//   Space,
// } from 'antd'

// //apis
// import { updateEmployee, addEmployee } from 'apis/employee'

// export default function EmployeeForm({
//   children,
//   reloadData,
//   record,
//   provinces = [],
//   roles = [],
//   districts = [],
//   branches = [],
// }) {
//   const [form] = Form.useForm()
//   const branchIdApp = useSelector((state) => state.branch.branchId )

//   const [province, setProvince] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [visible, setVisible] = useState(false)
//   const toggle = () => setVisible(!visible)

//   const _addOrEditUser = async () => {
//     try {
//       await form.validateFields()
//       const dataForm = form.getFieldsValue()

//       if (!validatePhone(dataForm.username)) {
//         notification.error({ message: 'Số điện thoại không đúng định dạng!' })
//         return
//       }

//       setLoading(true)
//       const body = {
//         ...dataForm,
//         avatar: '',
//         first_name: dataForm.first_name || '',
//         email: dataForm.email || '',
//         phone: dataForm.phone || '',
//         birth_day: dataForm.birthday || '',
//         address: dataForm.address || '',
//         district: dataForm.district || '',
//         province: dataForm.province || '',
//         role_id: +dataForm.role_id,
//       }
//       console.log(body)

//       let res
//       if (record) res = await updateEmployee(body, record.user_id)
//       else res = await addEmployee({ ...body })
//       console.log(res)

//       if (res.status === 200) {
//         if (res.data.success) {
//           toggle()
//           reloadData()
//           notification.success({
//             message: `${record ? 'Cập nhật' : 'Thêm'} nhân viên thành công`,
//           })
//         } else
//           notification.error({
//             message:
//               res.data.message ||
//               `${record ? 'Cập nhật' : 'Thêm'} nhân viên thất bại, vui lòng thử lại`,
//           })
//       } else
//         notification.error({
//           message:
//             res.data.message ||
//             `${record ? 'Cập nhật' : 'Thêm'} nhân viên thất bại, vui lòng thử lại`,
//         })
//       setLoading(false)
//     } catch (error) {
//       console.log(error)
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (visible) {
//       if (!record) {
//         form.resetFields()
//         form.setFieldsValue({
//           branch_id: +branchIdApp,
//           province: provinces.length ? provinces[0].province_name : '',
//           district: districts.length ? districts[0].district_name : '',
//         })
//         setProvince(provinces.length ? provinces[0].province_name : '')
//       } else {
//         setProvince(record.province || '')
//         form.setFieldsValue({
//           ...record,
//           birth_day: record.birth_day ? moment(record.birth_day) : null,
//         })
//       }
//     }
//   }, [visible])

//   return (
//     <>
//       <div onClick={toggle}>{children}</div>
//       <Drawer
//         width="70%"
//         footer={
//           <Row justify="end">
//             <Button
//               onClick={_addOrEditUser}
//               loading={loading}
//               size="large"
//               type="primary"
//               style={{ width: 120 }}
//             >
//               {record ? 'Cập nhật' : 'Thêm'}
//             </Button>
//           </Row>
//         }
//         title={`${record ? 'Cập nhật' : 'Thêm'} nhân viên`}
//         placement="right"
//         onClose={toggle}
//         visible={visible}
//       >
//         <Form layout="vertical" form={form}>
//           <Row justify="space-between" align="middle">
//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item
//                 label="Số điện thoại"
//                 name="username"
//                 rules={[
//                   { required: record ? false : true, message: 'Vui lòng nhập số điện thoại!' },
//                 ]}
//               >
//                 <Input disabled={record ? true : false} placeholder="Nhập số điện thoại" />
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={24} md={11} lg={11} xl={11} style={{ display: record && 'none' }}>
//               <Form.Item
//                 label="Mật khẩu"
//                 name="password"
//                 rules={[{ required: record ? false : true, message: 'Vui lòng nhập mật khẩu!' }]}
//               >
//                 <Input.Password placeholder="Nhập mật khẩu" />
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item label="Họ" name="first_name">
//                 <Input placeholder="Nhập họ" />
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item
//                 label="Tên"
//                 name="last_name"
//                 rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
//               >
//                 <Input placeholder="Nhập tên" />
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item
//                 name="branch_id"
//                 label="Chi nhánh làm việc"
//                 rules={[{ required: true, message: 'Vui lòng chọn chi nhánh làm việc' }]}
//               >
//                 <Select
//                   showSearch
//                   optionFilterProp="children"
//                   placeholder="Chọn chi nhánh làm việc"
//                 >
//                   {branches.map((branch, index) => (
//                     <Select.Option value={branch.branch_id} key={index}>
//                       {branch.name}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item label="Email" name="email">
//                 <Input placeholder="Nhập email" />
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item label="Ngày sinh" name="birthday">
//                 <DatePicker placeholder="Chọn ngày sinh" style={{ width: '100%' }} />
//               </Form.Item>
//             </Col>

//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item name="province" label="Tỉnh/thành phố">
//                 <Select
//                   value={province}
//                   onChange={setProvince}
//                   showSearch
//                   style={{ width: '100%' }}
//                   placeholder="Chọn tỉnh/thành phố"
//                   optionFilterProp="children"
//                   filterOption={(input, option) =>
//                     option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                   }
//                 >
//                   {provinces.map((province, index) => {
//                     return (
//                       <Select.Option value={province.province_name} key={index}>
//                         {province.province_name}
//                       </Select.Option>
//                     )
//                   })}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item name="district" label="Quận/huyện">
//                 <Select
//                   allowClear
//                   showSearch
//                   style={{ width: '100%' }}
//                   placeholder="Chọn quận/huyện"
//                   optionFilterProp="children"
//                   filterOption={(input, option) =>
//                     option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                   }
//                 >
//                   {districts
//                     .filter((e) => !province || e.province_name === province)
//                     .map((district, index) => {
//                       return (
//                         <Select.Option value={district.district_name} key={index}>
//                           {district.district_name}
//                         </Select.Option>
//                       )
//                     })}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item label="Địa chỉ" name="address">
//                 <Input placeholder="Nhập địa chỉ" />
//               </Form.Item>
//             </Col>
//             <Col xs={24} sm={24} md={11} lg={11} xl={11}>
//               <Form.Item
//                 initialValue={2}
//                 name="role_id"
//                 label="Vai trò"
//                 rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
//               >
//                 <Radio.Group defaultValue={2}>
//                   {roles.map((role, index) => (
//                     <Radio value={role.role_id} key={index}>
//                       {role.name}
//                     </Radio>
//                   ))}
//                 </Radio.Group>
//               </Form.Item>
//             </Col>
//           </Row>
//         </Form>
//       </Drawer>
//     </>
//   )
// }
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { validatePhone } from 'utils'

//antd
import {
  Form,
  Drawer,
  Row,
  Col,
  Button,
  Input,
  notification,
  DatePicker,
  Select,
  Radio,
  Space,
  InputNumber,
} from 'antd'

//apis
import { getMenu,updateMenu, addMenu } from 'apis/menu'

export default function MenuForm({
  children,
  reloadData,
  record,

  // status = ['new', 'tetting', 'ready to public','public','waiting for review','pending']
}) {
  const [form] = Form.useForm()
  
  const { Option } = Select;
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)
  const [menu, setMenu] = useState([])
  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })

  const _addOrEditMenu = async () => {
    try {
      await form.validateFields()
      const dataForm = form.getFieldsValue()

      setLoading(true)
      const body = {
        ...dataForm,
        avatar: '',
        name: dataForm.name || '',
        parent_menu_id: dataForm.parent_menu_id || '',
        description: dataForm.description || '',
        url: dataForm.url || '',
        view_position: dataForm.view_position || '',
        status: dataForm.status || ''
      }
      console.log(body)

      let res
      if (record) res = await updateMenu(body, record.menu_id)
      else res = await addMenu({ ...body })
      console.log(res)

      if (res.status === 200) {
        if (res.data.success) {
          toggle()
          reloadData()
          notification.success({
            message: `${record ? 'Cập nhật' : 'Thêm'} chức năng thành công`,
          })
        } else
          notification.error({
            message:
              res.data.message ||
              `${record ? 'Cập nhật' : 'Thêm'} chức năng thất bại, vui lòng thử lại`,
          })
      } else
        notification.error({
          message:
            res.data.message ||
            `${record ? 'Cập nhật' : 'Thêm'} chức năng thất bại, vui lòng thử lại`,
        })
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      if (!record) {
        form.resetFields()
      } else {
        form.setFieldsValue({
          ...record
        })
      }
    }
  }, [visible])

  const _getMenu = async () => {
    try {
      setLoading(true)
      const res = await getMenu({ ...paramsFilter })
      console.log(res)
      if (res.status === 200) {
        setMenu(res.data.data)
      }
      setLoading(false)
    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  }
  useEffect(() => {
    _getMenu()
  }, [])

  return (
    <>
      <div onClick={toggle}>{children}</div>
      <Drawer
        width="70%"
        footer={
          <Row justify="end">
            <Button
              onClick={_addOrEditMenu}
              loading={loading}
              size="large"
              type="primary"
              style={{ width: 120 }}
            >
              {record ? 'Cập nhật' : 'Thêm'}
            </Button>
          </Row>
        }
        title={`${record ? 'Cập nhật' : 'Thêm'} chức năng`}
        placement="right"
        onClose={toggle}
        visible={visible}
      >
        <Form layout="vertical" form={form}>
          <Row justify="space-between" align="middle">
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                label="Tên chức năng"
                name="name"
                rules={[
                  { required: record ? false : true, message: 'Vui lòng nhập tên chức năng!' },
                ]}
              >
                <Input disabled={record ? true : false} placeholder="Nhập tên chức năng" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11} style={{ display: record && 'none' }}>
              <Form.Item
              initialValue={'/'}
                label="URL"
                name="url"
                rules={[{ required: record ? false : true, message: 'Vui lòng nhập đường dẫn!' }]}
              >
                <Input  placeholder='Nhập đường dẫn' />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item label="Mô tả" name="description">
                <Input placeholder="Nhập mô tả" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                name="parent_menu_id"
                label="Menu cấp trên"
                
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Chọn menu cấp trên"
                >
                  {menu.map((menu, index) => (
                    <Select.Option value={menu.menu_id} key={index}>
                      {menu.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item label="Vị trí hiển thị" name="view_position">
                <InputNumber placeholder="Nhập vị trí hiển thị"  style={{ width: '100%' }}/>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select  style={{ width: 300 }}>
                  <Option value="new">new</Option>
                  <Option value="testing">testing</Option>
                  <Option value="ready to public" >ready to public</Option>
                  <Option value="public ">public</Option>
                  <Option value="waiting for review">waiting for review</Option>
                  <Option value="pending">pending</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  )
}
