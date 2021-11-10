import { loadModules } from 'esri-loader'

import sketch from './sketch'
import base from './base'
import bussiness from './bussiness'

// 扩展的地图方法放在这里
const META_DATA = {
  base,
  sketch,
  bussiness
}

class RegisteredData {
  constructor() {
    this.$store = {
      _registeredDataInst: this
    }
  }

  propOf(propName) {
    return this.$store[propName]
  }

  getData() {
    return this.$store
  }

  add(dataObj) {
    Object.assign(this.$store, dataObj)
  }
}


class DCImap {
  constructor() {
    this.isInit = false
    this.gisConstructor = {}
    this.registeredData = new RegisteredData()
  }

  init({ mapView, vue }) {
    this.isInit = true

    this.registeredData.add({
      $mapView: mapView,
      $vue: vue,
      $DCImap: this,
      $gisConstructor: this.gisConstructor
    })

    // 预先加载一些常用模块
    this.loadGisConstructor([
      { path: 'esri/Graphic', name: 'Graphic' },
      { path: 'esri/widgets/Sketch/SketchViewModel', name: 'SketchViewModel' },
      { path: 'esri/layers/GraphicsLayer', name: 'GraphicsLayer' },
      { path: 'esri/geometry/Polygon', name: 'Polygon' },
      { path: 'esri/geometry/Polyline', name: 'Polyline' },
      { path: 'esri/geometry/Point', name: 'Point' },
      { path: 'esri/geometry/geometryEngine', name: 'geometryEngine' }
    ])
  }

  dispose() {
    this.isInit = false
    this.registeredData = new RegisteredData()
  }

  ifInit(cb) {
    const isInit = this.isInit

    if (cb) {
      if (isInit) {
        return cb()
      } else {
        throw new Error('[$DCImap] 未执行 init 方法')
      }
    }

    return isInit
  }

  /**
   * 调用注册的地图方法
   * 注意：execute 方法会自动组装出一个类似$DCImap实例的对象作为待调用方法的this
   */
  execute(method, ...args) {
    return this.ifInit(() => {
      const registeredData = this.registeredData
      let fn = null
      let ctx = null

      if (registeredData.propOf(method)) {
        fn = registeredData.propOf(method)
        ctx = registeredData
      } else {
        const dataStore = registeredData.getData()
        let subData = null

        for (let subDataKey of Object.keys(dataStore)) {
          subData = dataStore[subDataKey]

          if (subData instanceof RegisteredData && subData.propOf(method)) {
            fn = subData.propOf(method)
            ctx = subData
            break
          }
        }
      }

      if (!fn) {
        throw new Error(`[$DCImap] 未找到方法名：${method}`)
      }

      if (!(fn instanceof Function)) {
        throw new Error(`[$DCImap] 不是方法名：${method}`)
      }

      const defaultProps = ['$mapView', '$vue', '$DCImap', '$gisConstructor']

      defaultProps.forEach(defaultProp => {
        !ctx.propOf(defaultProp) && ctx.add({ [defaultProp]: registeredData.propOf(defaultProp) })
      })

      return fn.call(ctx.getData(), ...args)
    })
  }

  /**
   * 加载gis模块
   * @param {Array<{ name, path }>} paths
   */
  loadGisConstructor(paths) {
    return loadModules(paths.map(item => item.path)).then(constructors => {
      constructors.forEach((item, index) => {
        this.gisConstructor[paths[index].name] = item
      })
    })
  }

  /**
   *
   * @param {object} meta -注册数据和方法
   * @param {string} metaName -注册数据和方法的存放位置，默认放在global
   */
  register(meta, metaName) {
    const { data, methods } = meta
    const registeredData = this.registeredData
    const result = {}

    data && Object.assign(result, data())
    methods && Object.assign(result, methods)
    metaName = metaName || 'global'

    if (!registeredData.propOf(metaName)) {
      registeredData.add({
        [metaName]: new RegisteredData()
      })
    }

    registeredData.propOf(metaName).add(result)
  }
}


/**
 * 在项目初始化时，注册该方法，在全局使用$DCImap调用
 * 在地图mapview实例化后，通过$DCImap.init({ mapView })初始化后，才能正确调用其他的地图方法
 * 通过$DCImap.execute(method, ...args)调用地图方法
 */
function registerDCImap(Vue) {
  const $DCImap = new DCImap()

  Object.entries(META_DATA).forEach(([metaName, meta]) => {
    $DCImap.register(meta, metaName)
  })

  Vue.prototype.$DCImap = $DCImap
}

export default registerDCImap
