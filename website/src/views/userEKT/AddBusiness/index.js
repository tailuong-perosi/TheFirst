import React from 'react'
import { Menu } from 'antd';

export default function HuongDan() {

    function getItem(label, key, icon, children, type) {
        return {
          key,
          icon,
          children,
          label,
          type,
        };
      }

      const onClick = (e) => {
        console.log('click ', e);
      };

    const items = [
          getItem('Item 1', 'g1', null, [getItem('Option 1', '1'), getItem('Option 2', '2')], 'group'),
          getItem('Item 2', 'g2', null, [getItem('Option 3', '3'), getItem('Option 4', '4')], 'group'),
        ]
  return (
    <div>
        <Menu onClick={onClick}
            style={{ width: 256,}}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={items} />
    </div>
  )
}
