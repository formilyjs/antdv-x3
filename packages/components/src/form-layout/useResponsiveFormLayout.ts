import { isArr, isValid } from '@formily/shared'
import type { ComponentInternalInstance, Ref } from 'vue'
import { getCurrentInstance } from 'vue'
import { onMounted, ref } from 'vue'

interface IProps {
  breakpoints?: number[]
  layout?:
    | 'vertical'
    | 'horizontal'
    | 'inline'
    | ('vertical' | 'horizontal' | 'inline')[]
  labelCol?: number | number[]
  wrapperCol?: number | number[]
  labelAlign?: 'right' | 'left' | ('right' | 'left')[]
  wrapperAlign?: 'right' | 'left' | ('right' | 'left')[]
  [props: string]: any
}

interface ICalcBreakpointIndex {
  (originalBreakpoints: number[], width: number): number
}

interface ICalculateProps {
  (target: Element, props: IProps): IProps
}

interface IUseResponsiveFormLayout {
  (props: IProps): {
    props: Ref<IProps>
  }
}

const useRefs = (): Record<string, unknown> => {
  const vm: ComponentInternalInstance | null = getCurrentInstance()
  return vm?.refs || {}
}

const calcBreakpointIndex: ICalcBreakpointIndex = (breakpoints, width) => {
  for (let i = 0; i < breakpoints.length; i++) {
    if (width <= breakpoints[i]) {
      return i
    }
  }
}

const calcFactor = <T>(value: T | T[], breakpointIndex: number): T => {
  if (Array.isArray(value)) {
    if (breakpointIndex === -1) return value[0]
    return value[breakpointIndex] ?? value[value.length - 1]
  } else {
    return value
  }
}

const factor = <T>(value: T | T[], breakpointIndex: number): T =>
  isValid(value) ? calcFactor(value as any, breakpointIndex) : value

const calculateProps: ICalculateProps = (target, props) => {
  const { clientWidth } = target
  const {
    breakpoints,
    layout,
    labelAlign,
    wrapperAlign,
    labelCol,
    wrapperCol,
    ...otherProps
  } = props
  const breakpointIndex = calcBreakpointIndex(breakpoints, clientWidth)

  return {
    layout: factor(layout, breakpointIndex),
    labelAlign: factor(labelAlign, breakpointIndex),
    wrapperAlign: factor(wrapperAlign, breakpointIndex),
    labelCol: factor(labelCol, breakpointIndex),
    wrapperCol: factor(wrapperCol, breakpointIndex),
    ...otherProps,
  }
}

export const useResponsiveFormLayout: IUseResponsiveFormLayout = (props) => {
  const { breakpoints } = props
  if (!isArr(breakpoints)) {
    return { props: ref(props) }
  }
  const layoutProps = ref<IProps>({})

  const updateUI = (target) => {
    layoutProps.value = calculateProps(target, props)
  }

  onMounted(() => {
    const { root } = useRefs()
    const observer = () => {
      updateUI(root)
    }
    const resizeObserver = new ResizeObserver(observer)
    if (root) {
      resizeObserver.observe(root as Element)
    }

    updateUI(root)

    return () => {
      resizeObserver.disconnect()
    }
  })

  return {
    props: layoutProps,
  }
}
