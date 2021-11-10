// 基于DCImap的sketch方法集合，封装的绘制类，简化绘制操作

class EasySketch { // 自定义绘制地图图形要素
  /**
   * @param {object} vm vue实例，实例需要挂载DCImap
   * @param {array} initFns 实例初始化后，自动执行的实例方法
   * @param {object} styleConf 绘制的默认样式 { pointSymbol, polylineSymbol, polygonSymbol, updateOnGraphicClick, layerIndex }
   * @param {array} immediate 是否立刻生成sketchViewModel实例
   *
   */
  constructor(vm, { initFns, styleConf, immediate = true } = {}) {
    /**
     * initFns: [
                  { name: 'functionName', args: ['arguments']}
                ]
     */

    this.vm = vm
    this.instId = null
    this.initFns = initFns || []
    this.styleConf = styleConf

    immediate && this._instContext()
  }
  bindListener (type, handler) {
    let instId = this._instContext()

    return this.vm.$DCImap.execute('bindCustomSketchListener', instId, type, handler)
  }
  bindPopupListener (type, handler) {
    let instId = this._instContext()

    return this.vm.$DCImap.execute('bindCustomSketchPopupListener', instId, type, handler)
  }
  bindMapviewGraphicListener (type, handler) {
    let instId = this._instContext()

    return this.vm.$DCImap.execute('bindMapviewGraphicListener', instId, type, handler)
  }
  draw (type, noClear) {
    let instId = this._instContext()

    this.vm.$DCImap.execute('drawCustomSketch', instId, type, noClear)
  }
  removeDrawings () {
    let instId = this._instContext()

    return this.vm.$DCImap.execute('removeCustomSketchAllGraphics', instId)
  }
  removeSelectedDrawings (graphics) {
    let instId = this._instContext()

    return this.vm.$DCImap.execute('removeCustomSketchGraphics', instId, graphics)
  }
  addGeometries (geometries, noClear, { enableGoTo } = {}) {
    let instId = this._instContext()

    if (!noClear) {
      this.removeDrawings()
    }

    let res = this.vm.$DCImap.execute('addCustomSketchGraphics', instId, geometries)

    enableGoTo && this.vm.$DCImap.execute('goTo', res)
    return res
  }
  addGraphics (graphics, noClear, { enableGoTo, opt = {} } = {}) { // geometry with styles
    let instId = this._instContext()

    if (!noClear) {
      this.removeDrawings()
    }

    let res = this.vm.$DCImap.execute('addCustomSketchGraphicsWithStyles', instId, graphics)

    enableGoTo && this.vm.$DCImap.execute('goTo', res, opt)
    return res
  }
  dispose () {
    this.vm && this.instId && this.vm.$DCImap.execute('destroyCustomSketch', this.instId)
    this.vm = null
    this.instId = null
  }
  cancel () {
    this.vm.$DCImap.execute('cancelCustomSketches')
  }
  // 私有方法
  _validateVM (cb) {
    let validation = !!this.vm

    cb && cb(validation)
    !validation && console.error('[EasySketch] 未传入vue实例')

    return validation
  }
  _validateId (cb) {
    let validation = !!this.instId

    cb && cb(validation)

    return validation
    // !validation && console.error('[EasySketch] 未创建绘制实例')
  }
  _instContext () {
    let hasVM = this._validateVM()

    if (hasVM) {
      let hasId = this._validateId()

      if (!hasId) {
        this.instId = this._createSketchInst(this.vm)

        let fns = this.initFns.filter(fnItem => this[fnItem.name])
        for (let fnItem of fns) {
          this[fnItem.name](...fnItem.args)
        }
      }

      return this.instId
    } else {
      throw new Error()
    }
  }
  _createSketchInst (vm) {
    return vm.$DCImap.execute('createCustomSketch', null, this.styleConf)
  }
}

export default EasySketch
