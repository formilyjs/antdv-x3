import { defineComponent, ref, h } from 'vue'
import { observer } from '@formily/reactive-vue'
import type { ArrayField } from '@formily/core'
import { useField, useFieldSchema, RecursionField } from '@formily/vue'
import { stylePrefix } from '../__builtins__/configs'
import { Tabs, Badge } from 'ant-design-vue'

import type { TabsProps } from 'ant-design-vue/lib/tabs'

export const ArrayTabs = observer(
  defineComponent<TabsProps>({
    name: 'ArrayTabs',
    /**
     * 这里加上emit事件，解决[Vue warn]: Invalid prop: type check failed for prop "onChange". Expected Function, got Array
     */
    emits: ['change'],
    setup(props, { attrs }) {
      const fieldRef = useField<ArrayField>()
      const schemaRef = useFieldSchema()

      const prefixCls = `${stylePrefix}-array-tabs`
      const activeKey = ref('tab-0')

      return () => {
        const field = fieldRef.value
        const schema = schemaRef.value
        const value = Array.isArray(field.value) ? field.value : []
        const dataSource = value?.length ? value : [{}]

        const onEdit = (targetKey: any, type: 'add' | 'remove') => {
          if (type == 'add') {
            const id = dataSource.length
            if (field?.value?.length) {
              field.push(null)
            } else {
              field.push(null, null)
            }
            activeKey.value = `tab-${id}`
          } else if (type == 'remove') {
            const index = targetKey.match(/-(\d+)/)?.[1]
            field.remove(Number(index))
            if (activeKey.value === targetKey) {
              activeKey.value = `tab-${index - 1}`
            }
          }
        }

        const badgedTab = (index: number) => {
          const tab = `${field.title || 'Untitled'} ${index + 1}`
          const path = field.address.concat(index)
          const errors = field.form.queryFeedbacks({
            type: 'error',
            address: `${path}.**`,
          })
          if (errors.length) {
            return h(
              Badge,
              {
                class: `${prefixCls}-errors-badge`,
                count: errors.length,
              },
              {
                default: () => [tab],
              }
            )
          }
          return tab
        }

        const renderItems = () =>
          dataSource?.map((item, index) => {
            const items = Array.isArray(schema.items)
              ? schema.items[index]
              : schema.items
            const key = `tab-${index}`
            return h(
              Tabs.TabPane,
              {
                key,
                closable: index !== 0,
                name: key,
              },
              {
                default: () =>
                  h(RecursionField, {
                    schema: items,
                    name: index,
                  }),
                tab: () => [badgedTab(index)],
              }
            )
          })

        return h(
          Tabs,
          {
            ...props,
            ...attrs,
            activeKey: activeKey.value,
            type: 'editable-card',
            onChange: (key) => {
              activeKey.value = key as string
            },
            onEdit: (key, action) => {
              onEdit(key, action)
            },
          },
          {
            default: () => [renderItems()],
          }
        )
      }
    },
  })
)

export default ArrayTabs
