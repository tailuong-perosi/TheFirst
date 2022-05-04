import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import style from './role-management.module.scss'
import { ACTION, PERMISSIONS } from 'consts'

//antd
import { Button, Drawer, Row, Input, Space, Form, notification, Tree } from 'antd'

//apis
import { createRole } from 'apis/role'

//components
import Permission from 'components/permission'
import treeData from './tree-data'

export default function CreateRole({ _getRoles, txt = 'Thêm vai trò' }) {
  const [visible, setVisible] = useState(false)
  const [checkedKeys, setCheckedKeys] = useState([])
  const toggle = () => {
    setCheckedKeys([])
    setVisible(!visible)
  }

  const halfTreeData = (treeData.length - 1) / 2
  const treeDataLeft = treeData.slice(0, halfTreeData)
  const treeDataRight = treeData.slice(halfTreeData, treeData.length)

  const [form] = Form.useForm()

  const dispatch = useDispatch()

  const _createRole = async () => {
    await form.validateFields()

    const formData = form.getFieldsValue()
    const body = { name: formData.name, permissions: checkedKeys }

    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await createRole(body)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Thêm vai trò thành công!' })
          form.resetFields()
          toggle()
          _getRoles()
        } else notification.error({ message: res.data.message || 'Thêm vai trò thất bại!' })
      } else notification.error({ message: res.data.message || 'Thêm vai trò thất bại!' })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      notification.error({ message: 'Thêm vai trò thất bại!' })
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }
  return (
    <>
      {/* <Permission permissions={[PERMISSIONS.tao_phan_quyen]}> */}
      <Button className={style['btn-add']} onClick={toggle} type="primary">
        {txt}
      </Button>
      {/* </Permission> */}
      <Drawer
        footer={
          <Row justify="end">
            <Space>
              <Button
                type="primary"
                onClick={_createRole}
              >
                Tạo
              </Button>
            </Space>
          </Row>
        }
        width="70%"
        title="Tạo vai trò"
        visible={visible}
        onClose={toggle}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: 15 }}>
            <Form.Item
              name="name"
              label="Tên vai trò"
              rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
            >
              <Input
                onPressEnter={_createRole}
                placeholder="Nhập tên vai trò"
                style={{ width: 350 }}
              />
            </Form.Item>
          </div>

          <Row wrap={false}>
            {[treeDataLeft, treeDataRight].map((data) => (
              <div style={{ width: '50%' }}>
                <Tree
                  checkable
                  treeData={data}
                  checkedKeys={checkedKeys}
                  checkStrictly
                  defaultExpandAll
                  selectable={false}
                  onCheck={(value, e) => {
                    if (!e.checked && e.checkedNodes.length === 0) {
                      notification.warning({ message: 'Vui lòng chọn ít nhất một quyền!' })
                      return false
                    }
                    setCheckedKeys(value.checked)
                  }}
                />
              </div>
            ))}
          </Row>
        </Form>
      </Drawer>
    </>
  )
}
