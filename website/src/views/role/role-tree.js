import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Col, notification, Row, Tree } from 'antd'
import { removeAccents } from 'utils'
import listTreeData from './tree-data'

import { ACTION, PERMISSIONS } from 'consts'

//apis
import { updateRole } from 'apis/role'

export default function PermissionForm({ search, role, _getRoles }) {
  const list = [...listTreeData]
  const halfTreeData = (list.length - 1) / 2
  const firstHalf = list.slice(0, halfTreeData)
  const secondHalf = list.slice(halfTreeData, list.length)

  const [rolePermission, setRolePermission] = useState(role.permissions)
  const [checkedKeys, setCheckedKeys] = useState(role.permissions)
  const dispatch = useDispatch()

  const _updatePermission = async (checkedKeys) => {
    const body = { ...role, permissions: checkedKeys }
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await updateRole(role.role_id, body)
      console.log(res)
      if (res.status === 200) {
        setRolePermission(rolePermission.filter((e) => e !== checkedKeys))
        _getRoles()
        notification.success({ message: 'Cập nhật vai trò thành công!', duration: 0.8 })
      }
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      notification.error({ message: 'Cập nhật vai trò thất bại!' })
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }
  return (
    <div style={{ overflowY: 'auto', maxHeight: 500 }}>
      <Row>
        {[firstHalf, secondHalf].map((data) => (
          <Col span={12}>
            <Tree
              checkable
              treeData={data.map((item) => ({
                ...item,
                title: (
                  <div>
                    {search &&
                    removeAccents(item.title)
                      .toLowerCase()
                      .includes(removeAccents(search.toLowerCase())) ? (
                      <mark style={{ backgroundColor: '#00D3E0' }}>{item.title}</mark>
                    ) : (
                      item.title
                    )}
                  </div>
                ),
              }))}
              checkedKeys={checkedKeys}
              checkStrictly
              defaultExpandAll
              selectable={false}
              onCheck={(value, e) => {
                if (!e.checked && checkedKeys.length === 1) {
                  notification.warning({ message: 'Một vai trò phải có ít nhất một quyền!' })
                  return false
                }
                setCheckedKeys(value.checked)
                _updatePermission(value.checked)
              }}
            />
          </Col>
        ))}
      </Row>
    </div>
  )
}
