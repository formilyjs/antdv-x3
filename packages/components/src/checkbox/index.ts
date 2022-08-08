import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { Checkbox as AntdCheckbox } from 'ant-design-vue'
import { defineComponent, h } from 'vue'
import { PreviewText } from '../preview-text'
import { composeExport } from '../__builtins__/shared'
const { Group } = AntdCheckbox

const CheckboxGroup = connect(
  Group,
  mapProps({
    dataSource: 'options',
  }),
  mapReadPretty(PreviewText.Select, {
    mode: 'tags',
  })
)

const __CheckBox = defineComponent({
  name: 'FCheckBox',
  inheritAttrs: false,
  props: ['onChange', 'checked'],
  setup(props, { attrs, slots }) {
    const newAttrs = {
      ...attrs,
    }
    delete newAttrs.value

    return () => {
      return h(AntdCheckbox, { ...props, ...newAttrs }, slots)
    }
  },
})

const _CheckBox = connect(
  __CheckBox,
  mapProps({
    value: 'checked',
  })
)

export const Checkbox = composeExport(_CheckBox, {
  Group: CheckboxGroup,
})

export default Checkbox
