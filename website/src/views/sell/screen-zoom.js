import React, { useState } from 'react'

import { Tooltip } from 'antd'

import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'

export default function ScreenZoom() {
  const [isFullScreen, setIsFullScreen] = useState(false)

  var elem = document.documentElement
  /* View in fullscreen */
  function openFullscreen() {
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen()
    }

    setIsFullScreen(true)
  }

  /* Close fullscreen */
  function closeFullscreen() {
    setIsFullScreen(false)

    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msExitFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  }

  return isFullScreen ? (
    <Tooltip title="Thu nhỏ màn hình">
      <FullscreenExitOutlined
        style={{ color: 'white', fontSize: 25 }}
        onClick={closeFullscreen}
      />
    </Tooltip>
  ) : (
    <Tooltip title="Mở rộng màn hình">
      <FullscreenOutlined
        style={{ color: 'white', fontSize: 25 }}
        onClick={openFullscreen}
      />
    </Tooltip>
  )
}
