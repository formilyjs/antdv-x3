import { useParentForm } from '@formily/vue'
import type { IFormFeedback } from '@formily/core'
import { observer } from '@formily/reactive-vue'
import { defineComponent, h } from 'vue'

import { Button as AntButton } from 'ant-design-vue'
import type { ButtonProps } from 'ant-design-vue/lib/button'

export interface ISubmitProps extends ButtonProps {
  onClick?: (e: MouseEvent) => any
  onSubmit?: (values: any) => any
  onSubmitSuccess?: (payload: any) => void
  onSubmitFailed?: (feedbacks: IFormFeedback[]) => void
}

export const Submit = observer(
  defineComponent({
    name: 'FSubmit',
    props: ['onClick', 'onSubmit', 'onSubmitSuccess', 'onSubmitFailed'],
    setup(props: ISubmitProps, { attrs, slots }) {
      const formRef = useParentForm()

      return () => {
        const {
          onClick,
          onSubmit = attrs?.onSubmit,
          onSubmitSuccess = attrs?.onSubmitSuccess,
          onSubmitFailed = attrs?.onSubmitFailed,
        } = props

        const form = formRef?.value
        return h(
          AntButton,
          {
            ...attrs,
            nativeType: attrs?.submit ? 'button' : 'submit',
            type: 'primary',
            loading:
              attrs.loading !== undefined ? attrs.loading : form?.submitting,
            onClick: (e: any) => {
              if (onClick) {
                if (onClick(e) === false) return
              }
              if (onSubmit) {
                form
                  ?.submit(onSubmit as (e: any) => void)
                  .then(onSubmitSuccess as (e: any) => void)
                  .catch(onSubmitFailed as (e: any) => void)
              }
            },
          },
          slots
        )
      }
    },
  })
)

export default Submit
