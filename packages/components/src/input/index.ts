import { composeExport, transformComponent } from '../__builtins__/shared'
import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { PreviewText } from '../preview-text'
import { Input as AntInput } from 'ant-design-vue'
import type { InputProps as AntInputProps } from 'ant-design-vue/lib/input'

const TransformElInput = transformComponent<AntInputProps>(AntInput, {
  change: 'input',
})

const InnerInput = connect(
  TransformElInput,
  mapProps({ readOnly: 'read-only' }),
  mapReadPretty(PreviewText.Input)
)

const TextArea = connect(
  AntInput.TextArea,
  mapProps((props) => {
    return {
      ...props,
    }
  }),
  mapReadPretty(PreviewText.Input)
)

export const Input = composeExport(InnerInput, {
  TextArea,
})

export default Input
