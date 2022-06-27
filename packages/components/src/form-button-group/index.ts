import { defineComponent, h } from 'vue'
import type { SpaceProps } from 'ant-design-vue/lib/space'
import { Space } from '../space'
import { FormBaseItem } from '../form-item'
import { stylePrefix } from '../__builtins__/configs'

export type FormButtonGroupProps = Omit<SpaceProps, 'align' | 'size'> & {
  align?: 'left' | 'right' | 'center'
  gutter?: number
  className?: string
  alignFormItem: boolean
}

export const FormButtonGroup = defineComponent({
  name: 'FormButtonGroup',
  props: {
    align: {
      type: String,
      default: 'left',
    },
    gutter: {
      type: Number,
      default: 8,
    },
    alignFormItem: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    const prefixCls = `${stylePrefix}-form-button-group`
    return () => {
      if (props.alignFormItem) {
        return h(
          FormBaseItem,
          {
            ...attrs,
            style: {
              margin: 0,
              padding: 0,
              width: '100%',
            },
            colon: false,
            label: ' ',
          },
          {
            default: () => h(Space, { size: props.gutter }, slots),
          }
        )
      } else {
        return h(
          Space,
          {
            ...attrs,
            class: [prefixCls],
            style: {
              justifyContent:
                props.align === 'left'
                  ? 'flex-start'
                  : props.align === 'right'
                  ? 'flex-end'
                  : 'center',
              display: 'flex',
            },
            size: props.gutter,
          },
          slots
        )
      }
    }
  },
})

export default FormButtonGroup
