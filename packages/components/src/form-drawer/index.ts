import { Button, Drawer, Space } from 'ant-design-vue'
import type { DrawerProps } from 'ant-design-vue/lib/drawer'
import { FormProvider, FragmentComponent } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import type { IMiddleware } from '@formily/shared'
import { isNum, isStr, isBool, isFn, applyMiddleware } from '@formily/shared'
import { toJS } from '@formily/reactive'
import type { Form, IFormProps } from '@formily/core'
import { createForm } from '@formily/core'
import type { Component, VNode } from 'vue'
import { h, defineComponent, Teleport, createApp } from 'vue'
import { stylePrefix } from '../__builtins__/configs'

import {
  isValidElement,
  resolveComponent,
  createPortalProvider,
  getProtalContext,
  loading,
} from '../__builtins__/shared'

const PORTAL_TARGET_NAME = 'FormDrawerFooter'

type FormDrawerRenderer = VNode | ((form: Form) => VNode)

type DrawerTitle = string | number | Component | VNode | (() => VNode)

const isDrawerTitle = (props: any): props is DrawerTitle => {
  return isNum(props) || isStr(props) || isBool(props) || isValidElement(props)
}

const getDrawerProps = (props: any): IDrawerProps => {
  if (isDrawerTitle(props)) {
    return {
      title: props,
    } as IDrawerProps
  } else {
    return props
  }
}

export interface IFormDrawer {
  forOpen(middleware: IMiddleware<IFormProps>): IFormDrawer
  forConfirm(middleware: IMiddleware<Form>): IFormDrawer
  forCancel(middleware: IMiddleware<Form>): IFormDrawer
  open(props?: IFormProps): Promise<any>
  close(): void
}

export interface IDrawerProps extends DrawerProps {
  onOk?: (event?: MouseEvent) => void | boolean
  onClose?: (event?: MouseEvent) => void | boolean
  loadingText?: string
}

export function FormDrawer(
  title: IDrawerProps,
  id: string,
  renderer: FormDrawerRenderer
): IFormDrawer
export function FormDrawer(
  title: IDrawerProps,
  renderer: FormDrawerRenderer
): IFormDrawer
export function FormDrawer(
  title: DrawerTitle,
  id: string,
  renderer: FormDrawerRenderer
): IFormDrawer
export function FormDrawer(
  title: DrawerTitle,
  renderer: FormDrawerRenderer
): IFormDrawer

export function FormDrawer(
  title: DrawerTitle | IDrawerProps,
  id: string | symbol | FormDrawerRenderer,
  renderer?: FormDrawerRenderer
): IFormDrawer {
  if (isFn(id) || isValidElement(id)) {
    renderer = id as FormDrawerRenderer
    id = 'form-drawer'
  }

  const prefixCls = `${stylePrefix}-form-drawer`
  const env = {
    root: document.createElement('div'),
    form: null,
    promise: null,
    app: null,
    instance: null,
    openMiddlewares: [],
    confirmMiddlewares: [],
    cancelMiddlewares: [],
  }

  document.body.appendChild(env.root)
  const props = getDrawerProps(title)

  const drawerProps = {
    width: '40%',
    ...props,
    onClose: () => {
      props.onClose?.()
      env.app?.unmount()
      env.instance = null
      env.app = null
      env.root?.parentNode?.removeChild(env.root)
      env.root = undefined
    },
  }

  const DrawerContent = observer(
    defineComponent({
      setup() {
        return () =>
          h(
            FragmentComponent,
            {},
            {
              default: () => resolveComponent(renderer, { form: env.form }),
            }
          )
      },
    })
  )

  const renderDrawer = (
    visible = true,
    resolve?: () => any,
    reject?: () => any
  ) => {
    if (!env.instance) {
      const ComponentConstructor = defineComponent({
        props: ['drawerProps'],
        data() {
          return {
            visible: false,
          }
        },
        render() {
          const {
            onOk,
            onClose,
            title,
            footer,
            okText = '确定',
            okType = 'primary',
            okButtonProps,
            cancelButtonProps,
            cancelText = '取消',
            ...drawerProps
          } = this.drawerProps
          return h(
            Drawer,
            {
              class: prefixCls,
              ...drawerProps,
              visible: this.visible,
              'onUpdate:visible': (val) => {
                this.visible = val
              },
              onClose: (e) => {
                if (onClose?.(e) !== false) {
                  reject?.()
                }
              },
              onOk: (e) => {
                if (onOk?.(e) !== false) {
                  resolve?.()
                }
              },
            },
            {
              default: () =>
                h(
                  FormProvider,
                  {
                    form: env.form,
                  },
                  {
                    default: () => [
                      h(
                        'div',
                        {
                          class: [`${prefixCls}-body`],
                        },
                        h(DrawerContent)
                      ),
                      h(
                        'div',
                        {
                          class: [`${prefixCls}-footer`],
                        },
                        h(
                          Space,
                          {},
                          {
                            default: () => {
                              const FooterProtalTarget = h(
                                'span',
                                {
                                  id: PORTAL_TARGET_NAME,
                                },
                                {}
                              )
                              if (footer === null) {
                                return [null, FooterProtalTarget]
                              } else if (footer) {
                                return [
                                  resolveComponent(footer),
                                  FooterProtalTarget,
                                ]
                              }
                              return [
                                h(
                                  Button,
                                  {
                                    ...cancelButtonProps,
                                    onClick: (e) => {
                                      onClose?.(e)
                                      reject()
                                    },
                                  },
                                  {
                                    default: () => resolveComponent(cancelText),
                                  }
                                ),
                                h(
                                  Button,
                                  {
                                    ...okButtonProps,
                                    type: okType,
                                    loading: env.form.submitting,
                                    onClick: (e) => {
                                      onOk?.(e)
                                      resolve()
                                    },
                                  },
                                  {
                                    default: () => resolveComponent(okText),
                                  }
                                ),
                                FooterProtalTarget,
                              ]
                            },
                          }
                        )
                      ),
                    ],
                  }
                ),
              title: () =>
                h(
                  FragmentComponent,
                  {},
                  { default: () => resolveComponent(title) }
                ),
            }
          )
        },
      })
      env.app = createApp(ComponentConstructor, {
        drawerProps,
        parent: getProtalContext(id as string | symbol),
      })
      env.instance = env.app.mount(env.root)
    }
    env.instance.visible = visible
  }

  const formDrawer = {
    forOpen: (middleware: IMiddleware<IFormProps>) => {
      if (isFn(middleware)) {
        env.openMiddlewares.push(middleware)
      }
      return formDrawer
    },
    forConfirm: (middleware: IMiddleware<Form>) => {
      if (isFn(middleware)) {
        env.confirmMiddlewares.push(middleware)
      }
      return formDrawer
    },
    forCancel: (middleware: IMiddleware<Form>) => {
      if (isFn(middleware)) {
        env.cancelMiddlewares.push(middleware)
      }
      return formDrawer
    },
    open: async (props: IFormProps) => {
      if (env.promise) return env.promise
      env.promise = new Promise(async (resolve, reject) => {
        try {
          props = await loading(drawerProps.loadingText, () =>
            applyMiddleware(props, env.openMiddlewares)
          )
          env.form = env.form || createForm(props)
        } catch (e) {
          reject(e)
        }

        renderDrawer(
          true,
          () => {
            env.form
              .submit(async () => {
                await applyMiddleware(env.form, env.confirmMiddlewares)
                resolve(toJS(env.form.values))
                formDrawer.close()
              })
              .catch(reject)
          },
          async () => {
            formDrawer.close()
          }
        )
      })
      return env.promise
    },
    close: () => {
      if (!env.root) return
      renderDrawer(false)
    },
  }
  return formDrawer
}

const DrawerFooter = defineComponent({
  name: 'DrawerFooter',
  setup(props, { slots }) {
    return () => {
      if (document.querySelector(`#${PORTAL_TARGET_NAME}`)) {
        return h(
          Teleport as any,
          {
            to: `#${PORTAL_TARGET_NAME}`,
          },
          slots
        )
      } else {
        return null
      }
    }
  },
})

FormDrawer.Footer = DrawerFooter
FormDrawer.Portal = createPortalProvider('form-drawer')

export default FormDrawer
