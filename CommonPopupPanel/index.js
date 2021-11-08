import createCommonPopupPanel from './createCommonPopupPanel'

const install = (Vue) => {
  Vue.prototype.$commonPopupPanel = createCommonPopupPanel
}

export { createCommonPopupPanel }
export default install
