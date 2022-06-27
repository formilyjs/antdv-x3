import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { Cascader as AntdCascader } from 'ant-design-vue'
import { PreviewText } from '../preview-text'
import { h } from 'vue'
import { LoadingOutlined } from '@ant-design/icons-vue'
import type { CascaderProps } from 'ant-design-vue/lib/cascader'

export const Cascader = connect(
  AntdCascader,
  mapProps<CascaderProps>(
    {
      dataSource: 'options',
    },
    (props, field) => {
      return {
        ...props,
        suffixIcon:
          field?.['loading'] || field?.['validating']
            ? h(LoadingOutlined)
            : props.suffixIcon,
      }
    }
  ),
  mapReadPretty(PreviewText.Cascader)
)

export default Cascader
