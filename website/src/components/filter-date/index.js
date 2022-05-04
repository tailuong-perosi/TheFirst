import React, { useState, useEffect } from 'react'

//antd
import { Select, DatePicker } from 'antd'

const { Option } = Select
const { RangePicker } = DatePicker
export default function FilterDate({
  placeholder = 'Lọc theo thời gian',
  paramsFilter = {},
  setParamsFilter,
  width = '100%',
  style,
}) {
  const [isOpenSelect, setIsOpenSelect] = useState(false)

  const toggleOpenSelect = () => setIsOpenSelect(!isOpenSelect)
  const [valueTime, setValueTime] = useState() //dùng để hiện thị value trong filter by time
  const [valueDateTimeSearch, setValueDateTimeSearch] = useState({})
  const [valueDateSearch, setValueDateSearch] = useState(null) //dùng để hiện thị date trong filter by date
  const PARAMS = [
    'from_date',
    'to_date',
    'today',
    'yesterday',
    'this_week',
    'last_week',
    'last_month',
    'this_month',
    'this_year',
    'last_year',
  ]

  //check có đang filter date hay không
  //nếu không thì reset value select date và select time
  const resetFilterDate = () => {
    const keysParamsFilter = Object.keys(paramsFilter)
    for (let i = 0; i < keysParamsFilter.length; i++)
      if (PARAMS.includes(keysParamsFilter[i])) return
    setValueDateSearch(null)
    setValueDateTimeSearch({})
    setValueTime()
  }

  useEffect(() => {
    resetFilterDate()
  }, [paramsFilter])

  return (
    <Select
      style={{ width: width, ...style }}
      bordered={false}
      open={isOpenSelect}
      onBlur={() => {
        if (isOpenSelect) toggleOpenSelect()
      }}
      onClick={() => {
        if (!isOpenSelect) toggleOpenSelect()
      }}
      allowClear
      showSearch
      placeholder={placeholder}
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      value={valueTime}
      onChange={async (value) => {
        setValueTime(value)

        paramsFilter.page = 1

        //xoa params search date hien tai
        const p = Object.keys(valueDateTimeSearch)
        if (p.length) delete paramsFilter[p[0]]

        setValueDateSearch(null)
        delete paramsFilter.from_date
        delete paramsFilter.to_date

        if (isOpenSelect) toggleOpenSelect()

        if (value) {
          const searchDate = Object.fromEntries([[value, true]]) // them params search date moi

          setParamsFilter({ ...paramsFilter, ...searchDate })
          setValueDateTimeSearch({ ...searchDate })
        } else {
          setParamsFilter({ ...paramsFilter })
          setValueDateTimeSearch({})
        }
      }}
      dropdownRender={(menu) => (
        <>
          <RangePicker
            onFocus={() => {
              if (!isOpenSelect) toggleOpenSelect()
            }}
            onBlur={() => {
              if (isOpenSelect) toggleOpenSelect()
            }}
            value={valueDateSearch}
            onChange={(dates, dateStrings) => {
              //khi search hoac filter thi reset page ve 1
              paramsFilter.page = 1

              if (isOpenSelect) toggleOpenSelect()

              //nếu search date thì xoá các params date
              delete paramsFilter.today
              delete paramsFilter.yesterday
              delete paramsFilter.this_week
              delete paramsFilter.last_week
              delete paramsFilter.last_month
              delete paramsFilter.this_month
              delete paramsFilter.this_year
              delete paramsFilter.last_year

              //Kiểm tra xem date có được chọn ko
              //Nếu ko thì thoát khỏi hàm, tránh cash app
              //và get danh sách order
              if (!dateStrings[0] && !dateStrings[1]) {
                delete paramsFilter.from_date
                delete paramsFilter.to_date

                setValueDateSearch(null)
                setValueTime()
              } else {
                const dateFirst = dateStrings[0]
                const dateLast = dateStrings[1]
                setValueDateSearch(dates)
                setValueTime(`${dateFirst} -> ${dateLast}`)

                dateFirst.replace(/-/g, '/')
                dateLast.replace(/-/g, '/')

                paramsFilter.from_date = dateFirst
                paramsFilter.to_date = dateLast
              }

              setParamsFilter({ ...paramsFilter })
            }}
            style={{ width: '100%' }}
          />
          {menu}
        </>
      )}
    >
      <Option value="today">Hôm nay</Option>
      <Option value="yesterday">Hôm qua</Option>
      <Option value="this_week">Tuần này</Option>
      <Option value="last_week">Tuần trước</Option>
      <Option value="this_month">Tháng này</Option>
      <Option value="last_month">Tháng trước</Option>
      <Option value="this_year">Năm này</Option>
      <Option value="last_year">Năm trước</Option>
    </Select>
  )
}
