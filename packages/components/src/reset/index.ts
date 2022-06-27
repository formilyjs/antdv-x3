import type { IFieldResetOptions } from '@formily/core'
import { useParentForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent, h } from 'vue'

import type { ButtonProps as AntButtonProps } from 'ant-design-vue/lib/button'
import { Button as AntButton } from 'ant-design-vue'

export type ResetProps = IFieldResetOptions & AntButtonProps

export const Reset = observer(
  defineComponent({
    name: 'Reset',
    props: {
      forceClear: {
        type: Boolean,
        default: false,
      },
      validate: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { attrs, slots }) {
      const formRef = useParentForm()
      return () => {
        const form = formRef?.value
        return h(
          AntButton,
          {
            attrs,
            onClick: (e: any) => {
              if (props?.onClick) {
                if (props.onClick(e) === false) return
              }
              form
                ?.reset('*', {
                  forceClear: props.forceClear,
                  validate: props.validate,
                })
                .then(attrs.resetValidateSuccess as (e: any) => void)
                .catch(attrs.resetValidateFailed as (e: any) => void)
            },
          },
          slots
        )
      }
    },
  })
)

export default Reset
