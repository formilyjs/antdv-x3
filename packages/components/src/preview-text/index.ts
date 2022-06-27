import { defineComponent, computed, h } from 'vue'
import { useField } from '@formily/vue'
import { isArr, isValid } from '@formily/shared'
import {
  createContext,
  resolveComponent,
  useContext,
  composeExport,
} from '../__builtins__/shared'
import { stylePrefix } from '../__builtins__/configs'
import type { InputProps } from 'ant-design-vue/lib/input'
import type { SelectProps } from 'ant-design-vue/lib/select'
import type {
  CascaderProps,
  CascaderOptionType,
} from 'ant-design-vue/lib/cascader'
import type { TimePickerProps } from 'ant-design-vue/lib/time-picker'
import type { DatePickerProps } from 'ant-design-vue/lib/date-picker'
import type { RangePickerProps } from 'ant-design-vue/lib/date-picker'

import { Tag } from 'ant-design-vue'

import { Space } from '../space'
import { observer } from '@formily/reactive-vue'
import type { Field } from '@formily/core'
import { formatMomentValue } from '../__builtins__'

const prefixCls = `${stylePrefix}-preview-text`
const PlaceholderContext = createContext('N/A')

export const usePlaceholder = (value?: any) => {
  const placeholderCtx = useContext(PlaceholderContext)
  const placeholder = computed(() => {
    return isValid(value) && value !== ''
      ? value
      : resolveComponent(placeholderCtx.value) || 'N/A'
  })

  return placeholder
}

const Select = observer(
  // eslint-disable-next-line vue/one-component-per-file
  defineComponent({
    name: 'PreviewTextSelect',
    props: [],
    setup(_props: SelectProps, { attrs }) {
      const fieldRef = useField<Field>()
      const field = fieldRef.value
      const props = attrs as unknown as SelectProps
      const placeholder = usePlaceholder()
      const getSelected = () => {
        const value = props.value
        if (props.mode === 'multiple' || props.mode === 'tags') {
          if (props.labelInValue) {
            return isArr(value) ? value : []
          }
          return isArr(value)
            ? value.map((val) => ({ label: val, value: val }))
            : []
        } else {
          if (props.labelInValue) {
            return isValid(value) ? [value] : []
          }
          return isValid(value) ? [{ label: value, value }] : []
        }
      }

      const getLabels = () => {
        const selected = getSelected()
        const dataSource: any[] = field?.dataSource?.length
          ? field.dataSource
          : props?.options?.length
          ? props.options
          : []
        if (!selected.length) {
          return h(
            Tag,
            {},
            {
              default: () => placeholder.value,
            }
          )
        }
        return selected.map((target, key) => {
          const text =
            dataSource?.find((item) => item.value == target?.value)?.label ||
            target?.label
          return h(
            Tag,
            {
              key,
            },
            {
              default: () => text || placeholder.value,
            }
          )
        })
      }

      return () => {
        return h(
          Space,
          {
            class: [prefixCls],
            style: attrs.style,
          },
          {
            default: () => getLabels(),
          }
        )
      }
    },
  })
)

// eslint-disable-next-line vue/one-component-per-file
const Input = observer(
  defineComponent<InputProps>({
    name: 'PreviewTextInput',
    setup(_props, { attrs, slots }) {
      return () => {
        const placeholder = usePlaceholder(attrs.value)
        return h(
          Space,
          {
            class: [prefixCls],
            style: attrs.style,
          },
          {
            default: () => [
              slots?.prepend?.(),
              slots?.prefix?.(),
              placeholder.value,
              slots?.suffix?.(),
              slots?.append?.(),
            ],
          }
        )
      }
    },
  })
)

// eslint-disable-next-line vue/one-component-per-file
const Text = defineComponent<any>({
  name: 'PreviewText',
  setup(_props, { attrs }) {
    const placeholder = usePlaceholder()

    return () => {
      return h(
        'div',
        {
          class: [prefixCls],
          style: attrs.style,
        },
        {
          default: () => placeholder.value,
        }
      )
    }
  },
})

export type PreviewCascaderProps = CascaderProps & {
  options: CascaderOptionType[]
}
const Cascader = observer(
  // eslint-disable-next-line vue/one-component-per-file
  defineComponent({
    name: 'PreviewTextCascader',
    setup(_props: PreviewCascaderProps, { attrs }) {
      const fieldRef = useField<Field>()
      const field = fieldRef.value
      const props = attrs as unknown as PreviewCascaderProps
      const dataSource: any[] = field?.dataSource?.length
        ? field.dataSource
        : props?.options?.length
        ? props.options
        : []
      const placeholder = usePlaceholder()
      const getSelected = () => {
        return isArr(props.value) ? props.value : []
      }

      const findLabel = (value: any, dataSource: any[]) => {
        for (let i = 0; i < dataSource?.length; i++) {
          const item = dataSource[i]
          if (item?.value === value) {
            return item?.label
          } else {
            const childLabel = findLabel(value, item?.children)
            if (childLabel) return childLabel
          }
        }
      }

      const getLabels = () => {
        const selected = getSelected()
        if (!selected?.length) {
          return h(
            Tag,
            {},
            {
              default: () => placeholder.value,
            }
          )
        }
        return selected.map((value, key) => {
          const text = findLabel(value, dataSource)
          return h(
            Tag,
            {
              key,
            },
            {
              default: () => text || placeholder.value,
            }
          )
        })
      }

      return () => {
        return h(
          Space,
          {
            class: [prefixCls],
            style: attrs.style,
          },
          {
            default: () => getLabels(),
          }
        )
      }
    },
  })
)

// eslint-disable-next-line vue/one-component-per-file
const TimePicker = defineComponent<TimePickerProps>({
  name: 'PreviewTextTimePicker',
  setup(_props, { attrs }) {
    const props = attrs as unknown as TimePickerProps
    const placeholder = usePlaceholder()
    const getLabels = () => {
      const labels = formatMomentValue(
        props.value,
        props.format,
        placeholder.value
      )
      return isArr(labels) ? labels.join('~') : labels
    }
    return () => {
      return h(
        'div',
        {
          class: [prefixCls],
          style: attrs.style,
        },
        {
          default: () => getLabels() as any,
        }
      )
    }
  },
})

// eslint-disable-next-line vue/one-component-per-file
const DatePicker = defineComponent({
  name: 'PreviewTextDatePicker',
  setup(_props: DatePickerProps, { attrs }) {
    const props = attrs as unknown as DatePickerProps
    const placeholder = usePlaceholder()
    const getLabels = () => {
      const labels = formatMomentValue(
        props.value,
        props.format,
        placeholder.value
      )
      return isArr(labels) ? labels.join('~') : labels
    }
    return () => {
      return h(
        'div',
        {
          class: [prefixCls],
          style: attrs.style,
        },
        {
          default: () => getLabels() as any,
        }
      )
    }
  },
})

// eslint-disable-next-line vue/one-component-per-file
const DateRangePicker = defineComponent({
  name: 'PreviewTextDatePicker',
  setup(_props: RangePickerProps, { attrs }) {
    const props = attrs as unknown as RangePickerProps
    const placeholder = usePlaceholder()
    const getLabels = () => {
      const labels = formatMomentValue(
        props.value,
        props.format,
        placeholder.value
      )
      return isArr(labels) ? labels.join('~') : labels
    }
    return () => {
      return h(
        'div',
        {
          class: [prefixCls],
          style: attrs.style,
        },
        {
          default: () => getLabels() as any,
        }
      )
    }
  },
})

export const PreviewText = composeExport(Text, {
  Input,
  Select,
  Cascader,
  DatePicker,
  DateRangePicker,
  TimePicker,
  Placeholder: PlaceholderContext.Provider,
  usePlaceholder,
})

export default PreviewText
