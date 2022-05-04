import React, { useState, useEffect } from 'react'
import { ACTION, PERMISSIONS, ROLE_DEFAULT, ROUTES } from 'consts'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

//antd
import {
  Col,
  Row,
  Collapse,
  notification,
  Checkbox,
  Drawer,
  Button,
  Switch,
  Input,
  Tree,
  Space,
} from 'antd'

import { ArrowLeftOutlined } from '@ant-design/icons'

//apis
import { createRole, getRoles, updateRole } from 'apis/role'

//components
import { rolesTranslate } from 'components/ExportCSV/fieldConvert'
import Permission from 'components/permission'
import TitlePage from 'components/title-page'

const { Panel } = Collapse
export default function Role() {
  const dispatch = useDispatch()
  const history = useHistory()
  const dataUser = useSelector((state) => state.login.dataUser)

  const [key, setKey] = useState('')
  const [visible, setVisible] = useState(false)
  const [treeAddData, setTreeAddData] = useState([])

  const showDrawer = () => setVisible(true)

  const onClose = () => setVisible(false)

  const PERMISSIONS_APP = [
    {
      pParent: 'tong_quan',
    },
    {
      pParent: 'ban_hang',
    },
    {
      pParent: 'danh_sach_don_hang',
      pChildren: ['tao_don_hang'],
    },
    {
      pParent: 'nhap_hang',
    },
    {
      pParent: 'san_pham',
      pChildren: [
        {
          pParent: 'quan_li_san_pham',
          pChildren: [
            'nhom_san_pham',
            'them_san_pham',
            'xoa_san_pham',
            'tao_nhom_san_pham',
            'xoa_nhom_san_pham',
            'cap_nhat_nhom_san_pham',
          ],
        },
      ],
    },
    {
      pParent: 'quan_li_chi_nhanh',
      pChildren: ['them_chi_nhanh', 'cap_nhat_chi_nhanh'],
    },

    {
      pParent: 'quan_li_kho',
      pChildren: ['them_kho', 'cap_nhat_kho'],
    },
    {
      pParent: 'quan_li_chuyen_hang',
      pChildren: ['tao_phieu_chuyen_hang', 'cap_nhat_trang_thai_phieu_chuyen_hang'],
    },
    {
      pParent: 'quan_li_nha_cung_cap',
      pChildren: ['them_nha_cung_cap', 'cap_nhat_nha_cung_cap'],
    },
    {
      pParent: 'quan_li_bao_hanh',
      pChildren: ['them_phieu_bao_hanh'],
    },
    {
      pParent: 'khuyen_mai',
      pChildren: ['them_khuyen_mai'],
    },
    {
      pParent: 'nhap_hang',
      pChildren: ['them_phieu_nhap_hang'],
    },
    {
      pParent: 'kiem_hang_cuoi_ngay',
      pChildren: ['them_phieu_kiem_hang'],
    },
    {
      pParent: 'phieu_chuyen_hang',
      pChildren: ['tao_phieu_chuyen_hang', 'cap_nhat_trang_thai_phieu_chuyen_hang'],
    },
    {
      pParent: 'tich_diem',
    },
    {
      pParent: 'quan_li_khach_hang',
      pChildren: ['them_khach_hang', 'cap_nhat_khach_hang'],
    },
    {
      pParent: 'bao_cao_don_hang',
    },
    {
      pParent: 'bao_cao_ton_kho',
    },
    {
      pParent: 'bao_cao_tai_chinh',
    },
    {
      pParent: 'van_chuyen',
      pChildren: [
        {
          pParent: 'doi_soat_van_chuyen',
          pChildren: ['them_phieu_doi_soat_van_chuyen'],
        },
        {
          pParent: 'quan_li_doi_tac_van_chuyen',
          pChildren: [
            'them_doi_tac_van_chuyen',
            'cap_nhat_doi_tac_van_chuyen',
            'xoa_doi_tac_van_chuyen',
          ],
        },
      ],
    },

    {
      pParent: 'cau_hinh_thong_tin',
      //thiếu ql cửa hàng permission them_cua_hang
      pChildren: [
        { pParent: 'quan_li_nguoi_dung', pChildren: ['them_nguoi_dung'] },
        {
          pParent: 'quan_li_nhan_su',
          pChildren: ['them_nhan_su', 'cap_nhat_nhan_su'],
        },
        { pParent: 'quan_li_thue', pChildren: ['them_thue'] },
        { pParent: 'quan_li_phan_quyen', pChildren: ['tao_quyen'] },
        {
          pParent: 'quan_li_thanh_toan',
          pChildren: ['them_hinh_thuc_thanh_toan'],
        },
        {
          pParent: 'nhap_xuat_file',
          isParent: true,
        },
        {
          pParent: 'nhat_ki_hoat_dong',
          isParent: true,
        },
      ],
    },
  ]

  const _updatePermission = async (body) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      console.log(body)
      const res = await updateRole(body, key)
      console.log(res)
      if (res.status === 200) {
        await _getRoles()
        notification.success({ message: 'Cập nhật thành công', duration: 1 })
      }
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const addPermission = (permissionAdd, typePermission) => {
    const role = rolePermission.find((e) => e.role_id === +key)
    if (role) {
      let body = { active: true }
      if (typePermission === 'permission_list') {
        console.log(permissionAdd)
        role.permission_list.push(permissionAdd)
        body.permission_list = role.permission_list
      }
      if (typePermission === 'menu_list') {
        role.menu_list.push(permissionAdd)
        body.menu_list = role.menu_list
      }

      _updatePermission(body)
    }
  }
  const onCheck = (checkedKeys, info) => {
    setTreeAddData([...checkedKeys, ...info.halfCheckedKeys])
  }

  const removePermission = (permissionAdd, typePermission) => {
    const role = rolePermission.find((e) => e.role_id === +key)
    if (role) {
      let body = { active: true }
      if (typePermission === 'permission_list') {
        const itemIndex = role.permission_list.findIndex((e) => e === permissionAdd)
        if (itemIndex !== -1) role.permission_list.splice(itemIndex, 1)

        body.permission_list = role.permission_list
      }
      if (typePermission === 'menu_list') {
        const itemIndex = role.menu_list.findIndex((e) => e === permissionAdd)
        if (itemIndex !== -1) role.menu_list.splice(itemIndex, 1)
        body.menu_list = role.menu_list
      }

      _updatePermission(body)
    }
  }

  const [rolePermission, setRolePermission] = useState([])
  const _getRoles = async () => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await getRoles(
        dataUser && dataUser.data._role.name === 'ADMIN' && { default: true }
      )
      console.log(res)
      if (res.status === 200) setRolePermission([...res.data.data])

      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const openNotificationAddRole = () => {
    notification.success({
      message: 'Thành công',
      description: 'Thêm vai trò mới thành công',
    })
  }
  const openNotificationAddRoleErrorMain = () => {
    notification.error({
      message: 'Thất bại',
      description: 'Tên vai trò đã tồn tại',
    })
  }
  const openNotificationAddRoleDelete = (e) => {
    notification.success({
      message: 'Thành công',
      description: e ? `Kích hoạt vai trò thành công` : 'Vô hiệu hóa vai trò thành công',
    })
  }
  const [name, setName] = useState('')
  const _updateRole = async (object, id, e) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await updateRole(object, id)
      if (res.status === 200) {
        await _getRoles()
        openNotificationAddRoleDelete(e)
      }
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }
  const _addRole = async (object) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await createRole(object)
      console.log(res)
      if (res.status === 200) {
        await _getRoles()
        onClose()
        openNotificationAddRole()

        setName('')
      } else {
        openNotificationAddRoleErrorMain()
      }
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const onChangeName = (e) => {
    setName(e.target.value)
  }
  const openNotificationAddRoleError = () => {
    notification.error({
      message: 'Thất bại',
      description: 'Bạn chưa nhập tên vai trò',
    })
  }
  const onClickAddRole = () => {
    if (name) {
      let permissionAdd = []
      let menuAdd = []
      treeAddData.forEach((e) => {
        let tmp = e.split('.')
        if (tmp[0] === 'menu') menuAdd.push(tmp[1])
        else permissionAdd.push(tmp[1])
      })
      const object = {
        name: name.toLowerCase(),
        permission_list: permissionAdd,
        menu_list: menuAdd,
      }
      _addRole(object)
    } else {
      openNotificationAddRoleError()
    }
  }

  const onClickDeleteDisable = (e, roleId, index) => {
    const object = {
      active: e,
      permission_list: [...rolePermission[index].permission_list],
      menu_list: [...rolePermission[index].menu_list],
    }
    _updateRole(object, roleId, e)
  }
  // initial data tree
  const getTitle = (permissionAdd, typePermission, values, color = '#EC7100') => {
    return (
      <Checkbox
        defaultChecked={[...values.permission_list, ...values.menu_list].includes(permissionAdd)}
        onClick={(e) => {
          if (e.target.checked) addPermission(permissionAdd, typePermission)
          else removePermission(permissionAdd, typePermission)
          e.stopPropagation()
        }}
      >
        <span style={{ color }}>{rolesTranslate(permissionAdd)}</span>
      </Checkbox>
    )
  }

  const generateTreeData = (data, roleProps, typePermission = 1) => {
    return data
      .filter((e) =>
        [
          ...((dataUser && dataUser.data._role.menu_list) || []),
          ...((dataUser && dataUser.data._role.permission_list) || []),
        ].includes(e.pParent || e)
      )
      .map((p) => {
        if (p.isParent || typeof p === 'string') {
          return {
            title: getTitle(
              p.pParent || p,
              typePermission ? 'menu_list' : 'permission_list',
              roleProps,
              typeof p === 'string' ? '#1772FA' : '#EC7100'
            ),
            key: p.pParent || p,
          }
        }
        return {
          title: getTitle(p.pParent, typePermission ? 'menu_list' : 'permission_list', roleProps),
          key: p.pParent,
          children:
            p.pChildren &&
            generateTreeData(p.pChildren, roleProps, typeof p.pChildren[0] === 'string' ? 0 : 1),
        }
      })
  }

  const generateCreateTreeData = (data) =>
    data
      .filter((e) =>
        [
          ...((dataUser && dataUser.data && dataUser.data._role.menu_list) || []),
          ...((dataUser && dataUser.data && dataUser.data._role.permission_list) || []),
        ].includes(e.pParent || e)
      )
      .map((p) => {
        if (typeof p === 'string') {
          return {
            title: <span style={{ color: '#1772FA' }}>{rolesTranslate(p)}</span>,
            key: `permission.${p}`,
          }
        }
        return {
          title: <span style={{ color: '#EC7100' }}>{rolesTranslate(p.pParent)}</span>,
          key: `menu.${p.pParent}`,
          children: p.pChildren && generateCreateTreeData(p.pChildren),
        }
      })

  useEffect(() => {
    _getRoles()
  }, [])

  return (
    <>
      <div className="card">
        <TitlePage
          title={
            <Row
              align="middle"
              style={{ cursor: 'pointer' }}
              onClick={() => history.push(ROUTES.CONFIGURATION_STORE)}
            >
              <ArrowLeftOutlined style={{ marginRight: 8 }} />
              Quản lý phân quyền
            </Row>
          }
        >
          <Permission permissions={[PERMISSIONS.tao_quyen]}>
            <Button onClick={showDrawer} type="primary" size="large">
              Thêm vai trò
            </Button>
          </Permission>
        </TitlePage>

        <div style={{ width: '100%' }}>
          <Collapse accordion onChange={setKey} expandIconPosition="left">
            {rolePermission.map((values, index) => {
              if (
                values.name === 'ADMIN' ||
                (values.name === 'BUSINESS' && dataUser.data._role.name !== 'ADMIN') ||
                (values.name === 'EMPLOYEE' && dataUser.data._role.name !== 'ADMIN')
              )
                return ''

              return (
                <Panel
                  extra={
                    <div
                      style={{
                        display:
                          values.default && //Object.keys(ROLE_DEFAULT).includes(values.name)
                          'none',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch
                        defaultChecked={values.active}
                        onChange={(e) => onClickDeleteDisable(e, values.role_id, index)}
                      />
                    </div>
                  }
                  header={`${values.name}`}
                  key={values.role_id}
                >
                  <Row gutter={10}>
                    <Col>
                      <Row align="middle">
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: '#EC7100',
                          }}
                        ></div>{' '}
                        Menu
                      </Row>
                    </Col>
                    <Col>
                      <Row align="middle">
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: '#1772FA',
                          }}
                        ></div>{' '}
                        Quyền thao tác
                      </Row>
                    </Col>
                  </Row>
                  <Tree
                    showIcon={false}
                    defaultExpandAll={true}
                    // defaultExpandParent={true}
                    treeData={[...generateTreeData(PERMISSIONS_APP, values)]}
                  />
                </Panel>
              )
            })}
          </Collapse>
        </div>
      </div>
      <Drawer
        title="Thêm vai trò"
        width={950}
        onClose={onClose}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <Row justify="end">
            <Button onClick={onClickAddRole} style={{ width: 100 }} type="primary" size="large">
              Lưu
            </Button>
          </Row>
        }
      >
        <div>
          <div>
            <div
              style={{
                color: 'black',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
              }}
            >
              Tên vai trò
            </div>
            <div>
              <Input
                size="large"
                name="name"
                value={name}
                onChange={onChangeName}
                placeholder="Nhập tên vai trò mới"
              />
            </div>
          </div>
          <Space>
            <Row align="middle">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#EC7100',
                  marginRight: 7,
                }}
              ></div>
              Menu
            </Row>
            <Row align="middle">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#1772FA',
                  marginRight: 7,
                }}
              ></div>{' '}
              Quyền thao tác
            </Row>
          </Space>
          <div style={{ marginTop: '1rem' }}>
            <Tree
              checkable
              defaultExpandAll
              onCheck={onCheck}
              treeData={[...generateCreateTreeData(PERMISSIONS_APP)]}
            />
          </div>
        </div>
      </Drawer>
    </>
  )
}
