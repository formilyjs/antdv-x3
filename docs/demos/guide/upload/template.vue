<template>
  <Form :form="form" :label-col="4" :wrapper-col="10">
    <ArrayField
      name="upload"
      title="上传"
      :decorator="[FormItem]"
      :component="[NormalUpload]"
      required
    />
    <ArrayField
      name="upload2"
      title="卡片上传"
      :decorator="[FormItem]"
      :component="[CardUpload]"
      required
    />
    <ArrayField
      name="upload3"
      title="拖拽上传"
      :decorator="[FormItem]"
      :component="[DraggerUpload]"
      required
    />
    <FormButtonGroup align-form-item>
      <Submit @submit="onSubmit">提交</Submit>
    </FormButtonGroup>
  </Form>
</template>

<script lang="tsx">
import { createForm } from '@formily/core'
import { ArrayField } from '@formily/vue'
import { defineComponent, h } from 'vue'
import {
  Form,
  FormItem,
  Upload,
  Submit,
  FormButtonGroup,
} from '@formily/antdv-x3'
import { Button } from 'ant-design-vue'
import { UploadOutlined, InboxOutlined } from '@ant-design/icons-vue'

const UploadButton = () => {
  return <Button>上传图片</Button>
}
const NormalUpload = (props, { attrs }) => {
  return (
    <Upload
      {...props}
      {...attrs}
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      headers={{
        authorization: 'authorization-text',
      }}
    >
      <Button>
        <UploadOutlined />
        上传文件{' '}
      </Button>
    </Upload>
  )
}

const CardUpload = (props, { attrs }) => {
  return (
    <Upload
      {...props}
      {...attrs}
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      listType="picture-card"
      headers={{
        authorization: 'authorization-text',
      }}
    >
      <UploadOutlined style={{ fontSize: 20 }} />
    </Upload>
  )
}

const DraggerUpload = (props, { attrs }) => {
  return (
    <Upload.Dragger
      {...props}
      {...attrs}
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
    >
      <p class="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p class="ant-upload-text">Click or drag file to this area to upload</p>
      <p class="ant-upload-hint">
        Support for a single or bulk upload. Strictly prohibit from uploading
        company data or other band files
      </p>
    </Upload.Dragger>
  )
}
const form = createForm()

export default {
  // eslint-disable-next-line vue/no-reserved-component-names
  components: { Form, ArrayField, Submit, FormButtonGroup },
  data() {
    return {
      NormalUpload,
      CardUpload,
      DraggerUpload,
      FormItem,
      form,
    }
  },
  methods: {
    onSubmit(value) {
      console.log(value)
    },
  },
}
</script>
