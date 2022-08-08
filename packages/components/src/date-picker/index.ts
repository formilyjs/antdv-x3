import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { DatePicker as AntdDatePicker } from 'ant-design-vue'
import type { DatePickerProps as AntdDatePickerProps } from 'ant-design-vue/lib/date-picker'
import { composeExport } from '../__builtins__'
import { PreviewText } from '../preview-text'

const mapDateFormat = function () {
  const getDefaultFormat = (props: AntdDatePickerProps) => {
    if (props['picker'] === 'month') {
      return 'YYYY-MM'
    } else if (props['picker'] === 'quarter') {
      return 'YYYY-\\QQ'
    } else if (props['picker'] === 'year') {
      return 'YYYY'
    } else if (props['picker'] === 'week') {
      return 'YYYY-wo'
    }
    return props['showTime'] ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
  }
  return (props: any) => {
    // const format = props['format'] || getDefaultFormat(props)
    return {
      ...props,
      valueFormat: props.valueFormat || getDefaultFormat(props),
    }
  }
}

export const _DatePicker = connect(
  AntdDatePicker,
  mapProps(mapDateFormat()),
  mapReadPretty(PreviewText.DatePicker)
)

export const _RangePicker = connect(
  AntdDatePicker.RangePicker,
  mapProps(mapDateFormat()),
  mapReadPretty(PreviewText.DateRangePicker)
)

export const _WeekPicker = connect(
  AntdDatePicker.WeekPicker,
  mapProps(mapDateFormat())
)

export const _MonthPicker = connect(
  AntdDatePicker.MonthPicker,
  mapProps(mapDateFormat())
)

export const DatePicker = composeExport(_DatePicker, {
  RangePicker: _RangePicker,
  WeekPicker: _WeekPicker,
  MonthPicker: _MonthPicker,
})

export default DatePicker
