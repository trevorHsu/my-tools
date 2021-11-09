import createCommonPopupPanel from './createCommonPopupPanel'

const install = payload => {
  if (payload instanceof Function) {
    payload.prototype.$commonPopupPanel = createCommonPopupPanel
  } else {
    return Vue => {
      const defaultOptions = payload

      Vue.prototype.$commonPopupPanel = function(newOptions) {
        return createCommonPopupPanel.call(
          this,
          Object.assign({}, defaultOptions || {}, newOptions || {})
        )
      }
    }
  }
}

export default install
