import { connect, mapProps } from '@formily/vue'
import {
  Upload as AntdUpload,
  UploadDragger as AntdUploadDrager,
} from 'ant-design-vue'
import { composeExport } from '../__builtins__'
import type {
  UploadFile,
  UploadProps as AntdUploadProps,
} from 'ant-design-vue/lib/upload'
import { defineComponent, h } from 'vue'

export type IUploadOnchange = (fileList: UploadFile[]) => void

export type IUploadProps = Omit<AntdUploadProps, 'onChange'> & {
  onChange?: IUploadOnchange
}

export type IDraggerUploadProps = Omit<AntdUploadProps, 'onChange'> & {
  onChange?: IUploadOnchange
}

const UploadWrapper = defineComponent<IUploadProps>({
  name: 'UploadWrapper',
  emits: ['change'],
  setup(props, { slots, attrs, emit }) {
    return () => {
      const children = {
        ...slots,
      }
      const { onChange, ...restAttrs } = attrs
      return h(
        AntdUpload,
        {
          ...restAttrs,
          onChange: ({ fileList }) => {
            ;(onChange as IUploadOnchange)?.(fileList)
            emit('change', fileList)
          },
        },
        children
      )
    }
  },
})

const UploaDraggerdWrapper = defineComponent<IUploadProps>({
  name: 'UploaDraggerdWrapper',
  emits: ['change'],
  setup(props, { slots, attrs, emit }) {
    return () => {
      const children = {
        ...slots,
      }
      const { onChange, ...restAttrs } = attrs

      return h(
        AntdUploadDrager,
        {
          ...restAttrs,
          onChange: ({ fileList }) => {
            ;(onChange as IUploadOnchange)?.(fileList)
            emit('change', fileList)
          },
        },
        children
      )
    }
  },
})

const _Upload = connect(
  UploadWrapper,
  mapProps({
    value: 'fileList',
    onInput: 'onChange',
  })
)

const UploadDragger = connect(
  UploaDraggerdWrapper,
  mapProps({
    value: 'fileList',
    onInput: 'onChange',
  })
)

export const Upload = composeExport(_Upload, {
  Dragger: UploadDragger,
})

export default Upload
