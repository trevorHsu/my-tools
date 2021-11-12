// 绘制功能

// 可动态扩展的绘制实例的方法
// 实例不再使用时，需要调用销毁方法，手动销毁，避免常驻内存

/**
 * 使用方法：
 *
 * 生成实例：
 * createCustomSketch：生成实例后，将给回调函数传入一个实例ID；需要保存该ID，后面利用该ID操作其他方法
 *
 * 绘制控制：
 * drawCustomSketch：绘制
 * addCustomSketchGraphics: 增加绘制图形
 * removeCustomSketchGraphics：删除实例中的一组graphic
 * removeCustomSketchAllGraphics：删除实例的所有绘制
 *
 * 事件监听：
 * bindCustomSketchListener：绑定事件后，将通过回调函数传入一个监听器ID；可利用该ID来移除该监听
 * removeCustomSketchListener：移除某一监听
 * removeCustomSketchAllListeners：移除实例下的所有监听
 *
 * 销毁实例：
 * destroyCustomSketch：销毁某一实例，包括该实例下的所有监听器
 */

const ID_TYPE = {
  sketch: 'CUSTOM_SKETCH',
  listener: 'CUSTOM_SKETCH_LISTENER'
}

const genId = function(idType) {
  let timestamp = Date.now()
  let randomNum = Math.random() * 100000 >> 0

  return `${idType}-${timestamp}-${randomNum}`
}

const SKETCH = {
  data() {
    return {
      customSketches: {
        instances: {
          /**
           * [instId]: {
           *  sketchLayer: GraphicsLayer
           *  bufferLayer: GraphicsLayer
           *  viewModel: SketchViewModel
           *  listenerIds: []
           *  sketchStyle: {}
           * }
           */
        },
        listeners: {
          /**
           * [listenerId]: {
           *    listener: listenerObject,
           *    instId,
           *    listenerId
           * }
           */
        }
      }
    }
  },
  methods: {
    cancelCustomSketches() {
      this.customSketches &&
      this.customSketches.instances &&
      Object.values(this.customSketches.instances).forEach(inst => {
        inst.viewModel && inst.viewModel.cancel()
      })
    },
    // instance
    createCustomSketch(cb, customSketchStyle) { // callback returns an instId
      customSketchStyle = customSketchStyle || {}
      const ID = genId(ID_TYPE.sketch)
      const lineColor = [211, 132, 80, 0.7]
      const sketchStyle = {
        pointSymbol: (customSketchStyle.pointSymbol) || {
          type: 'simple-marker',
          style: 'circle',
          size: 10,
          color: lineColor,
          outline: {
            color: lineColor,
            size: 10
          }
        },
        polylineSymbol: (customSketchStyle.polylineSymbol) || {
          type: 'simple-line',
          color: lineColor,
          width: 4
        },
        polygonSymbol: (customSketchStyle.polygonSymbol) || {
          type: 'simple-fill',
          color: [150, 150, 150, 0.2],
          outline: {
            color: lineColor,
            width: 4
          }
        }
      }

      const view = this.$mapView
      const ESRI = this.$gisConstructor
      const updateOnGraphicClick = typeof customSketchStyle.updateOnGraphicClick !== 'undefined'
        ? !!customSketchStyle.updateOnGraphicClick
        : true
      const layerIndex = (customSketchStyle.layerIndex) || 2

      let sketchLayer = new ESRI.GraphicsLayer({ title: 'sketchLayer' })
      let bufferLayer = new ESRI.GraphicsLayer({ title: 'bufferLayer' }) // buffer相关功能未开发
      let viewModel = new ESRI.SketchViewModel({
        layer: sketchLayer,
        view,
        pointSymbol: sketchStyle.pointSymbol,
        polylineSymbol: sketchStyle.polylineSymbol,
        polygonSymbol: sketchStyle.polygonSymbol,
        updateOnGraphicClick
      })

      this.customSketches.instances[ID] = {
        sketchLayer,
        bufferLayer,
        viewModel,
        sketchStyle,
        listenerIds: []
      }

      view.map.addMany([sketchLayer, bufferLayer], layerIndex)

      cb && cb(ID)

      return ID
    },
    destroyCustomSketch(instId) {
      this._validateInstId(instId, instData => {
        const { sketchLayer, bufferLayer, viewModel } = instData

        // listener
        this.removeCustomSketchAllListeners(instId)
        // graphics
        this.removeCustomSketchAllGraphics(instId)
        this.$mapView.map.removeMany([sketchLayer, bufferLayer])
        // isntances
        sketchLayer.destroy()
        bufferLayer.destroy()
        viewModel.cancel()
        viewModel.destroy()

        delete this.customSketches.instances[instId]
      })
    },
    getCustomSketchInst(instId) {
      let result = false

      if (instId && this.customSketches.instances[instId]) {
        result = this.customSketches.instances[instId]
      }

      return result
    },
    _validateInstId(instId, cb) { // 判断绘制实例是否存在
      let instData = this.getCustomSketchInst(instId)

      if (!instData) {
        console.log('sketch instance not found')
        return false
      } else {
        cb && cb(instData)
        return true
      }
    },
    _validateListenerId(listenerId, cb) { // 判断监听器是否存在
      let listenerData = listenerId && this.customSketches.listeners[listenerId]

      if (!listenerData) {
        console.log('sketch instance\'s listener not found')
        return false
      } else {
        this._validateInstId(listenerData.instId, instData => {
          cb && cb(listenerData.listener, instData)
        })

        return true
      }
    },
    // plot
    drawCustomSketch(instId, type, noClear) {
      this._validateInstId(instId, instData => {
        const { sketchLayer, bufferLayer, viewModel } = instData

        // todo
        // this.stopToolbarWidget()

        if (!noClear) {
          sketchLayer && sketchLayer.removeAll()
          bufferLayer && bufferLayer.removeAll()
        }

        type ? viewModel.create(type) : viewModel.cancel()
      })
    },
    addCustomSketchGraphicsWithStyles(instId, geometries, cb) {
      let result

      geometries && geometries.length &&
      this._validateInstId(instId, instData => {
        const { sketchLayer } = instData

        let graphics = geometries.map(geometry => {
          return this.$MapManager.execute('constructGraphic', geometry)
        })

        sketchLayer.addMany(graphics)
        cb && cb(graphics)

        result = graphics
      })

      return result
    },
    addCustomSketchGraphics(instId, geometries, cb) {
      let result

      geometries && geometries.length &&
      this._validateInstId(instId, instData => {
        const { sketchLayer, sketchStyle } = instData
        const getSymbol = function(geometry, styleData) {
          let key = ''

          switch (geometry.type) {
            case 'point':
              key = 'pointSymbol'
              break
            case 'polyline':
              key = 'polylineSymbol'
              break
            case 'polygon':
              key = 'polygonSymbol'
              break
          }

          return styleData[key]
        }

        let graphics = geometries.map(geometry => {
          let symbol = getSymbol(geometry, sketchStyle)
          let geoData = { geometry, symbol }
          return this.$MapManager.execute('constructGraphic', geoData)
        })

        sketchLayer.addMany(graphics)

        cb && cb(graphics)

        result = graphics
      })

      return result
    },
    removeCustomSketchGraphics(instId, graphics, cb) {
      graphics && graphics.length &&
      this._validateInstId(instId, instData => {
        const { sketchLayer, bufferLayer } = instData

        sketchLayer.removeMany(graphics)
        bufferLayer.removeMany(graphics)

        cb && cb()
      })
    },
    removeCustomSketchAllGraphics(instId, cb) {
      this._validateInstId(instId, instData => {
        const { sketchLayer, bufferLayer } = instData

        sketchLayer && sketchLayer.removeAll()
        bufferLayer && bufferLayer.removeAll()

        cb && cb()
      })
    },
    // listener
    bindCustomSketchListener(instId, type, func, cb) { // callback returns a listenerId
      let result

      this._validateInstId(instId, instData => {
        const ID = genId(ID_TYPE.listener)
        const { viewModel, listenerIds } = instData
        const sketchListener = viewModel.on(type, func)

        listenerIds.push(ID)
        this.customSketches.listeners[ID] = {
          listener: sketchListener,
          instId,
          listenerId: ID
        }

        cb && cb(ID)

        result = ID
      })

      return result
    },
    bindCustomSketchPopupListener(instId, type, func, cb) {
      let result

      this._validateInstId(instId, instData => {
        const ID = genId(ID_TYPE.listener)
        const { viewModel, listenerIds } = instData
        const sketchListener = viewModel.view.popup.on(type, func)

        listenerIds.push(ID)
        this.customSketches.listeners[ID] = {
          listener: sketchListener,
          instId,
          listenerId: ID
        }

        cb && cb(ID)

        result = ID
      })

      return result
    },
    bindMapviewGraphicListener(instId, type, func, cb) {
      let result

      this._validateInstId(instId, instData => {
        const ID = genId(ID_TYPE.listener)
        const { viewModel, listenerIds, sketchLayer, bufferLayer } = instData
        const sketchListener = viewModel.view.on(type, (e) => {
          viewModel.view.hitTest(e).then(res => {
            if (res && res.results.length) {
              let refinedList = []

              res.results.forEach(item => {
                (item.graphic.layer === sketchLayer || item.graphic.layer === bufferLayer) && refinedList.push(item)
              })

              refinedList.length && func({
                results: refinedList,
                screenPoint: res.screenPoint
              })
            }
          })
        })

        listenerIds.push(ID)
        this.customSketches.listeners[ID] = {
          listener: sketchListener,
          instId,
          listenerId: ID
        }

        cb && cb(ID)

        result = ID
      })

      return result
    },
    removeCustomSketchListener(listenerId) {
      this._validateListenerId(listenerId, (listener, instData) => {
        const { listenerIds } = instData

        listener.remove()
        delete this.customSketches.listeners[listenerId]

        let listenerIndex = listenerIds.indexOf(listenerId)
        listenerIndex !== -1 && listenerIds.splice(listenerIndex, 1)
      })
    },
    removeCustomSketchAllListeners(instId) {
      this._validateInstId(instId, instData => {
        const { listenerIds } = instData

        listenerIds.forEach(listenerId => {
          let listenerData = this.customSketches.listeners[listenerId]

          listenerData && listenerData.listener.remove()
          delete this.customSketches.listeners[listenerId]
        })

        listenerIds.splice(0)
      })
    }
  }
}

export default SKETCH
