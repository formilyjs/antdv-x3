import type { Ref } from 'vue'
import { defineComponent, ref, computed, h } from 'vue'
import type { GeneralField, FieldDisplayTypes, ArrayField } from '@formily/core'
import {
  useField,
  useFieldSchema,
  FragmentComponent,
  RecursionField,
} from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { isArr, isBool } from '@formily/shared'
import { ArrayBase } from '../array-base'
import { stylePrefix } from '../__builtins__/configs'
import { composeExport } from '../__builtins__/shared'
import type { Schema } from '@formily/json-schema'
import type { VNode } from 'vue'
import { Table, Pagination, Select, Badge } from 'ant-design-vue'
import { Space } from '../space'
import type { TableProps, ColumnProps } from 'ant-design-vue/lib/table'
import type { PaginationProps } from 'ant-design-vue/lib/pagination'
import type { SelectProps } from 'ant-design-vue/lib/select'

interface ObservableColumnSource {
  field: GeneralField
  columnProps: ColumnProps
  schema: Schema
  display: FieldDisplayTypes
  name: string
}

interface IArrayTablePaginationProps extends PaginationProps {
  dataSource?: any[]
}

interface IStatusSelectProps extends SelectProps {
  pageSize?: number
  onChange?: (value: any, option: any | any[]) => void
}

const isColumnComponent = (schema: Schema) => {
  return schema['x-component']?.indexOf('Column') > -1
}

const isOperationsComponent = (schema: Schema) => {
  return schema['x-component']?.indexOf('Operations') > -1
}

const isAdditionComponent = (schema: Schema) => {
  return schema['x-component']?.indexOf('Addition') > -1
}

const useArrayTableSources = (
  arrayFieldRef: Ref<ArrayField>,
  schemaRef: Ref<Schema>
) => {
  const arrayField = arrayFieldRef.value
  const parseSources = (schema: Schema): ObservableColumnSource[] => {
    if (
      isColumnComponent(schema) ||
      isOperationsComponent(schema) ||
      isAdditionComponent(schema)
    ) {
      if (!schema['x-component-props']?.['dataIndex'] && !schema['name'])
        return []
      const name = schema['x-component-props']?.['dataIndex'] || schema['name']
      const field = arrayField.query(arrayField.address.concat(name)).take()
      const columnProps =
        field?.component?.[1] || schema['x-component-props'] || {}
      const display = field?.display || schema['x-display']
      return [
        {
          name,
          display,
          field,
          schema,
          columnProps,
        },
      ]
    } else if (schema.properties) {
      return schema.reduceProperties((buf, schema) => {
        return buf.concat(parseSources(schema))
      }, [])
    }
  }

  const parseArrayItems = (schema: Schema['items']) => {
    if (!schema) return []
    const sources: ObservableColumnSource[] = []
    const items = isArr(schema) ? schema : [schema]
    return items.reduce((columns, schema) => {
      const item = parseSources(schema)
      if (item) {
        return columns.concat(item)
      }
      return columns
    }, sources)
  }

  if (!schemaRef.value) throw new Error('can not found schema object')

  return parseArrayItems(schemaRef.value.items)
}

const useArrayTableColumns = (
  sources: ObservableColumnSource[]
): ColumnProps[] => {
  return sources.reduce((buf, { name, columnProps, schema, display }, key) => {
    if (display !== 'visible') return buf
    if (!isColumnComponent(schema)) return buf
    return buf.concat({
      ...columnProps,
      key,
      dataIndex: name,
      customRender: ({ record, index }) => {
        const children = h(
          ArrayBase.Item,
          {
            key: `${key}${index}`,
            index,
            record,
          },
          () =>
            h(RecursionField, {
              schema,
              name: index,
              onlyRenderProperties: true,
            })
        )
        return children
      },
    })
  }, [])
}

const useAddition = () => {
  const schema = useFieldSchema()
  return schema.value.reduceProperties((addition, schema, key) => {
    if (isAdditionComponent(schema)) {
      return h(RecursionField, {
        schema,
        name: key,
      })
    }
    return addition
  }, null)
}

const schedulerRequest = {
  request: null,
}

const StatusSelect = observer(
  defineComponent({
    props: ['value', 'options', 'pageSize', 'onChange'],
    setup(props: IStatusSelectProps) {
      const fieldRef = useField<ArrayField>()
      const prefixCls = `${stylePrefix}-array-table`

      return () => {
        const field = fieldRef.value
        const width = String(props.options?.length).length * 15
        const errors = field.errors
        const parseIndex = (address: string) => {
          return Number(
            address
              .slice(address.indexOf(field.address.toString()) + 1)
              .match(/(\d+)/)?.[1]
          )
        }
        return h(
          Select,
          {
            style: {
              width: `${width < 60 ? 60 : width}px`,
            },
            class: [
              `${prefixCls}-status-select`,
              {
                'has-error': errors?.length,
              },
            ],
            value: props.value,
            virtual: true,
            onChange: props.onChange,
          },
          {
            default: () => {
              return props.options?.map(({ label, value }) => {
                const hasError = errors.some(({ address }) => {
                  const currentIndex = parseIndex(address)
                  const startIndex = ((value as number) - 1) * props.pageSize
                  const endIndex = (value as number) * props.pageSize
                  return currentIndex >= startIndex && currentIndex <= endIndex
                })
                return h(
                  Select.Option,
                  {
                    key: value,
                    label,
                    value,
                  },
                  {
                    default: () => {
                      if (hasError) {
                        return h(Badge, { dot: true }, () => label)
                      }
                      return label
                    },
                  }
                )
              })
            },
          }
        )
      }
    },
  }),
  {
    scheduler: (update) => {
      clearTimeout(schedulerRequest.request)
      schedulerRequest.request = setTimeout(() => {
        update()
      }, 100)
    },
  }
)

const ArrayTablePagination = defineComponent<IArrayTablePaginationProps>({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const prefixCls = `${stylePrefix}-array-table`
    const current = ref(1)
    return () => {
      const props = attrs as unknown as IArrayTablePaginationProps
      const pageSize = computed(() => props.pageSize || 10)
      const dataSource = computed(() => props.dataSource || [])
      const startIndex = computed(() => (current.value - 1) * pageSize.value)
      const size = computed(() => props.size || 'default')
      const endIndex = computed(() => startIndex.value + pageSize.value - 1)
      const total = computed(() => dataSource.value?.length || 0)
      const totalPage = computed(() => Math.ceil(total.value / pageSize.value))
      const pages = computed(() =>
        Array.from(new Array(totalPage.value)).map((_, index) => {
          const page = index + 1
          return {
            label: page,
            value: page,
          }
        })
      )

      const handleChange = (val: number) => {
        current.value = val
      }

      const renderPagination = () => {
        if (totalPage.value <= 1) return
        return h(
          'div',
          {
            class: [`${prefixCls}-pagination`],
          },
          h(Space, {}, () => [
            h(StatusSelect, {
              value: current.value,
              onChange: handleChange,
              pageSize: pageSize.value,
              options: pages.value,
              notFoundContent: false,
            }),
            h(Pagination, {
              ...props,
              pageSize: pageSize.value,
              current: current.value,
              size: size.value,
              total: total.value,
              showSizeChanger: false,
              onChange: handleChange,
            }),
          ])
        )
      }
      return h(FragmentComponent, {}, () =>
        slots?.default?.(
          dataSource.value?.slice(startIndex.value, endIndex.value + 1),
          renderPagination
        )
      )
    }
  },
})

const ArrayTableInner = observer(
  defineComponent<TableProps>({
    name: 'ArrayTable',
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      const fieldRef = useField<ArrayField>()
      const schemaRef = useFieldSchema()
      const prefixCls = `${stylePrefix}-array-table`
      const { getKey, keyMap } = ArrayBase.useKey(schemaRef.value)

      const defaultRowKey = (record: any) => {
        return getKey(record)
      }

      return () => {
        const props = attrs as unknown as TableProps
        const field = fieldRef.value
        const dataSource = Array.isArray(field.value) ? field.value.slice() : []
        const sources = useArrayTableSources(fieldRef, schemaRef)
        const columns = useArrayTableColumns(sources)
        const pagination = isBool(props.pagination) ? {} : props.pagination

        const renderStateManager = () =>
          sources.map((column, key) => {
            //专门用来承接对Column的状态管理
            if (!isColumnComponent(column.schema)) return
            return h(RecursionField, {
              name: column.name,
              schema: column.schema,
              onlyRenderSelf: true,
              key,
            })
          })

        const renderTable = (dataSource?: any[], pager?: () => VNode) => {
          return h(
            'div',
            {
              class: prefixCls,
            },
            h(
              ArrayBase,
              {
                keyMap,
              },
              () => [
                h(
                  Table,
                  {
                    ...attrs,
                    size: 'small',
                    bordered: true,
                    rowKey: defaultRowKey,
                    pagination: false,
                    columns,
                    dataSource,
                  },
                  slots
                ),
                h(
                  'div',
                  {
                    style: {
                      marginTop: '5px',
                      marginBottom: '5px',
                    },
                  },
                  pager?.()
                ),
                renderStateManager(),
                useAddition(),
              ]
            )
          )
        }

        if (!pagination) {
          return renderTable(dataSource, null)
        }

        return h(
          ArrayTablePagination,
          {
            ...pagination,
            dataSource,
          },
          {
            default: renderTable,
          }
        )
      }
    },
  })
)

const ArrayTableColumn = defineComponent({
  name: 'ArrayTableColumn',
  render() {
    return null
  },
})

export const ArrayTable = composeExport(ArrayTableInner, {
  Column: ArrayTableColumn,
  Index: ArrayBase.Index,
  SortHandle: ArrayBase.SortHandle,
  Addition: ArrayBase.Addition,
  Remove: ArrayBase.Remove,
  MoveDown: ArrayBase.MoveDown,
  MoveUp: ArrayBase.MoveUp,
  useArray: ArrayBase.useArray,
  useIndex: ArrayBase.useIndex,
  useRecord: ArrayBase.useRecord,
})

export default ArrayTable
