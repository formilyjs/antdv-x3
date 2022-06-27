import { connect, mapProps } from '@formily/vue'
import { TreeSelect as AntdTreeSelect } from 'ant-design-vue'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { h } from 'vue'

export const TreeSelect = connect(
  AntdTreeSelect,
  mapProps(
    {
      dataSource: 'treeData',
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
  )
)

export default TreeSelect
