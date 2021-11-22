class EasySketch { // 自定义绘制地图图形要素
  /**
   * @param {object} vm vue实例
   * @param {array} initFns 实例初始化后，自动执行的实例方法
   * @param {object} styleConf 绘制的默认样式 { pointSymbol, polylineSymbol, polygonSymbol, updateOnGraphicClick, layerIndex }
   * @param {array} immediate 是否立刻生成sketchViewModel实例
   * @param {array} mapViewName 绘制方法作用的地图视图的名称，该名称与MapManager中的mapViewName相同
   *
   */
  constructor(vm, { initFns, styleConf, immediate = true, mapViewName } = {}) {
    /**
     * initFns: [
                  { name: 'functionName', args: ['arguments']}
                ]
     */

    this.vm = vm
    this.instId = null
    this.initFns = initFns || []
    this.styleConf = styleConf
    this.mapViewName = mapViewName

    immediate && this._instContext()
  }
  bindListener (type, handler) {
    let instId = this._instContext()

    return this._execute('bindCustomSketchListener', instId, type, handler)
  }
  bindPopupListener (type, handler) {
    let instId = this._instContext()

    return this._execute('bindCustomSketchPopupListener', instId, type, handler)
  }
  bindMapviewGraphicListener (type, handler) {
    let instId = this._instContext()

    return this._execute('bindMapviewGraphicListener', instId, type, handler)
  }
  draw (type, noClear) {
    let instId = this._instContext()

    this._execute('drawCustomSketch', instId, type, noClear)
  }
  removeDrawings () {
    let instId = this._instContext()

    return this._execute('removeCustomSketchAllGraphics', instId)
  }
  removeSelectedDrawings (graphics) {
    let instId = this._instContext()

    return this._execute('removeCustomSketchGraphics', instId, graphics)
  }
  addGeometries (geometries, noClear, { enableGoTo } = {}) {
    let instId = this._instContext()

    if (!noClear) {
      this.removeDrawings()
    }

    let res = this._execute('addCustomSketchGraphics', instId, geometries)

    enableGoTo && this._execute('goTo', res)
    return res
  }
  addGraphics (graphics, noClear, { enableGoTo, opt = {} } = {}) { // geometry with styles
    let instId = this._instContext()

    if (!noClear) {
      this.removeDrawings()
    }

    let res = this._execute('addCustomSketchGraphicsWithStyles', instId, graphics)

    enableGoTo && this._execute('goTo', res, opt)
    return res
  }
  getSketches ({ type = 'geometry' } = {}) {
    let instId = this._instContext()

    return this._execute('getSketches', instId, { type })
  }
  dispose () {
    this.vm && this.instId && this._execute('destroyCustomSketch', this.instId)
    this.vm = null
    this.instId = null
  }
  cancel () {
    this._execute('cancelCustomSketches')
  }
  // 私有方法
  _execute(...args) {
    return this.mapViewName
      ? this.vm.$MapManager.at(this.mapViewName).execute(...args)
      : this.vm.$MapManager.execute(...args)
  }
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
    return vm.$MapManager.execute('createCustomSketch', null, this.styleConf)
  }
}

export default EasySketch
