import { Popover } from 'antd'
import React from 'react'

export const HoverImage = ({ children, image }) => {
  const Image = () =>
    image ? (
      <img src={image} alt="" width={320} height={320} style={{ objectFit: 'cover' }} />
    ) : (
      'Chưa có hình ảnh'
    )
  return (
    <div>
      <Popover content={<Image />} placement="top">
        {children}
      </Popover>
    </div>
  )
}
