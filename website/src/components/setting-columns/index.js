import React, { useEffect, useState } from 'react'

//components antd
import { Modal, Button, Checkbox } from 'antd'

import { SettingOutlined } from '@ant-design/icons'

export default function SettingColumns({
  columns,
  setColumns,
  columnsDefault,
  nameColumn,
  width = 700,
  btn = (
    <Button icon={<SettingOutlined />} type="primary" size="large">
      Điều chỉnh cột
    </Button>
  ),
}) {
  const [visible, setVisible] = useState(false)

  const toggle = () => setVisible(!visible)

  useEffect(() => {
    if (!localStorage.getItem(nameColumn)) {
      localStorage.setItem(nameColumn, JSON.stringify(columnsDefault))
      setColumns([...columnsDefault])
    } else setColumns(JSON.parse(localStorage.getItem(nameColumn)))
  }, [])

  return (
    <>
      <div onClick={toggle}>{btn}</div>

      <Modal
        width={width}
        title="Điều chỉnh cột hiện thị trên trang danh sách"
        visible={visible}
        footer={null}
        onCancel={toggle}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {columnsDefault.map((e, index) => (
            <div style={{ width: '33.333333%', marginBottom: 10 }}>
              <Checkbox
                defaultChecked={columns.filter((v) => v.title === e.title).length}
                onChange={(event) => {
                  let columnsNew = [...columns]

                  if (event.target.checked) {
                    columnsNew.splice(index, 0, { ...e })
                  } else {
                    const indexHidden = columns.findIndex((c) => c.title === e.title)
                    columnsNew.splice(indexHidden, 1)
                  }

                  //lưu setting columns lên localstorage
                  localStorage.setItem(nameColumn, JSON.stringify(columnsNew))

                  setColumns([...columnsNew])
                }}
              >
                {e.title}
              </Checkbox>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
