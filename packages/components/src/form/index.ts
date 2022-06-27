import type { Form as FormType, IFormFeedback } from '@formily/core'
import { FormProvider as _FormProvider, useForm } from '@formily/vue'
import { defineComponent, h } from 'vue'
import type { FormLayoutProps } from '../form-layout'
import { FormLayout } from '../form-layout'
import { PreviewText } from '../preview-text'
import type { Component, VNode, DefineComponent } from 'vue'

const FormProvider = _FormProvider as unknown as Component

export interface FormProps extends FormLayoutProps {
  form?: FormType
  component?: Component
  previewTextPlaceholder: string | (() => VNode)
  onAutoSubmit?: (values: any) => any
  onAutoSubmitFailed?: (feedbacks: IFormFeedback[]) => void
}

export const Form = defineComponent({
  name: 'FForm',
  props: [
    'form',
    'component',
    'previewTextPlaceholder',
    'onAutoSubmit',
    'onAutoSubmitFailed',
  ],
  setup(props: FormProps, { attrs, slots }) {
    const top = useForm()

    return () => {
      const {
        form,
        component = 'form',
        onAutoSubmit = attrs?.autoSubmit,
        onAutoSubmitFailed = attrs?.autoSubmitFailed,
        previewTextPlaceholder = slots?.previewTextPlaceholder,
      } = props

      const renderContent = (form: FormType) => {
        return h(
          PreviewText.Placeholder as DefineComponent,
          {
            value: previewTextPlaceholder,
          },
          {
            default: () => [
              h(
                FormLayout,
                {
                  ...attrs,
                },
                {
                  default: () => [
                    h(
                      component as DefineComponent,
                      {
                        onSubmit: (e: Event) => {
                          e?.stopPropagation?.()
                          e?.preventDefault?.()
                          form
                            .submit(onAutoSubmit as (e: any) => void)
                            .catch(onAutoSubmitFailed as (e: any) => void)
                        },
                      },
                      slots
                    ),
                  ],
                }
              ),
            ],
          }
        )
      }

      if (form) {
        return h(
          FormProvider as DefineComponent,
          { form },
          {
            default: () => renderContent(form),
          }
        )
      }

      if (!top.value) throw new Error('must pass form instance by createForm')

      return renderContent(top.value)
    }
  },
})

export default Form
