import { defineComponent, reactive, computed, h } from 'vue'
import { observer } from '@formily/reactive-vue'
import { model } from '@formily/reactive'
import {
  useField,
  useFieldSchema,
  RecursionField,
  FragmentComponent,
} from '@formily/vue'
import type { Schema, SchemaKey } from '@formily/json-schema'
import { Tabs, Badge } from 'ant-design-vue'
import { stylePrefix } from '../__builtins__/configs'

import type { TabsProps, TabPaneProps } from 'ant-design-vue/lib/tabs'

import { composeExport } from '../__builtins__/shared'

const { TabPane } = Tabs

export interface IFormTab {
  activeKey: string
  setActiveKey(key: string): void
}

export interface IFormTabProps extends TabsProps {
  formTab?: IFormTab
}

export interface IFormTabPaneProps extends TabPaneProps {
  key: string
}

const useTabs = () => {
  const tabsField = useField().value
  const schema = useFieldSchema().value
  const tabs: { name: SchemaKey; props: any; schema: Schema }[] = reactive([])
  schema.mapProperties((schema, name) => {
    const field = tabsField.query(tabsField.address.concat(name)).take()
    if (field?.display === 'none' || field?.display === 'hidden') return
    if (schema['x-component']?.indexOf('TabPane') > -1) {
      tabs.push({
        name,
        props: {
          key: schema?.['x-component-props']?.key || name,
          ...schema?.['x-component-props'],
        },
        schema,
      })
    }
  })
  return tabs
}

const createFormTab = (defaultActiveKey?: string) => {
  const formTab = model({
    activeKey: defaultActiveKey,
    setActiveKey(key: string) {
      formTab.activeKey = key
    },
  })
  return formTab
}

const FormTabInner = observer(
  // eslint-disable-next-line vue/one-component-per-file
  defineComponent({
    name: 'FormTab',
    props: ['formTab'],
    setup(props: IFormTabProps, { attrs }) {
      const field = useField().value
      const formTabRef = computed(() => props.formTab ?? createFormTab())

      const prefixCls = `${stylePrefix}-form-tab`

      return () => {
        const formTab = formTabRef.value
        const tabs = useTabs()
        const activeKey =
          props.activeKey || formTab?.activeKey || tabs?.[0]?.name
        const badgedTab = (key: SchemaKey, props: any) => {
          const errors = field.form.queryFeedbacks({
            type: 'error',
            address: `${field.address.concat(key)}.*`,
          })
          if (errors.length) {
            return () =>
              h(
                Badge,
                {
                  class: [`${prefixCls}-errors-badge`],
                  count: errors.length,
                  size: 'small',
                },
                { default: () => props.tab }
              )
          }
          return props.tab
        }

        const getTabs = (tabs) => {
          return tabs.map(({ props, schema, name }) => {
            return h(
              TabPane,
              {
                key: name,
                ...props,
                tab: badgedTab(name, props),
                forceRender: true,
              },
              {
                default: () => [
                  h(
                    RecursionField,
                    {
                      schema,
                      name,
                    },
                    {}
                  ),
                ],
              }
            )
          })
        }
        return h(
          Tabs,
          {
            ...attrs,
            class: [prefixCls],
            style: attrs.style,
            activeKey: activeKey,
            onChange: (key) => {
              props?.onChange?.(key)
              formTab.setActiveKey?.(key as string)
            },
          },
          {
            default: () => getTabs(tabs),
          }
        )
      }
    },
  })
)

// eslint-disable-next-line vue/one-component-per-file
const FormTabPane = defineComponent<IFormTabPaneProps>({
  name: 'FormTabPane',
  setup(_props, { slots }) {
    return () => h(FragmentComponent, {}, slots)
  },
})

export const FormTab = composeExport(FormTabInner, {
  TabPane: FormTabPane,
  createFormTab,
})

export default FormTab
