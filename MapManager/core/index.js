import { loadModules } from 'esri-loader'
import DEFAULT_METHODS from './defaultMethods'
import {
  $CHARGING_MAPS,
  $STORE,
  $MAP_VIEW,
  $ATTRIBUTES,
  $MAP_MANAGER,
  $GIS_CONSTRUCTOR,
  $ID,
  $TYPE,
  $METHOD_COLLECTION,
  $MAP_VIEW_NAME,
  $METHOD_COLLECTION_NAME
} from './constant/properties'
import { METHOD_COLLECTION, MAP_VIEW_CONTROLLER } from './constant/values'

let mapViewId = 0

class RegisteredData {
  constructor(data, options) {
    this[$STORE] = {
      _registeredDataInst: this
    }

    data && this.add(data, options)
  }

  propOf(propName) {
    return this[$STORE][propName]
  }

  getData() {
    return this[$STORE]
  }

  add(dataObj, { overWrite = true, exclude } = {}) {
    Object.keys(dataObj).forEach(key => {
      (overWrite ? !this[$STORE].hasOwnProperty(key) : true) &&
      (exclude ? !exclude.includes(key) : true) &&
      (this[$STORE][key] = dataObj[key])
    })
  }
}

const EXECUTION_PROCESS = {
  getCondition(mapManagerDataStore, method, args) {
    let mapViewController, methodName, newArgs

    if (method instanceof RegisteredData && method.propOf($TYPE) === MAP_VIEW_CONTROLLER) {
      mapViewController = method
      methodName = args[0]
      newArgs = args.slice(1)
    } else {
      mapViewController = mapManagerDataStore[$CHARGING_MAPS][0]
      methodName = method
      newArgs = args
    }

    return [mapViewController, methodName, newArgs]
  },
  matchMethod(mapManagerDataStore, methodName) {
    let fn = null
    let origMethodCollection = null
    let subData = null

    for (let subDataKey of Object.keys(mapManagerDataStore)) {
      subData = mapManagerDataStore[subDataKey]

      if (
        subData instanceof RegisteredData &&
        subData.propOf($TYPE) === METHOD_COLLECTION &&
        subData.propOf('methods') &&
        subData.propOf('methods')[methodName]
      ) {
        fn = subData.propOf('methods')[methodName]
        origMethodCollection = subData
        break
      }
    }

    return [fn, origMethodCollection]
  },
  getMethodCtx(mapViewController, origMethodCollection) {
    const mapViewMethodCollection = mapViewController.propOf($METHOD_COLLECTION)
    const methodCollectionName = origMethodCollection.propOf($METHOD_COLLECTION_NAME)

    if (!mapViewMethodCollection.propOf(methodCollectionName)) {
      const origMethodData = origMethodCollection.getData()
      const methodCtx = new RegisteredData()

      methodCtx.add(
        Object.assign(
          { [$METHOD_COLLECTION_NAME]: methodCollectionName },
          origMethodData.data ? origMethodData.data() : {},
          origMethodData.methods ? origMethodData.methods : {}
        )
      )

      methodCtx.add(
        mapViewController.getData(),
        { exclude: [$METHOD_COLLECTION, $TYPE] }
      )

      mapViewMethodCollection.add({ [methodCollectionName]: methodCtx })
    }

    const ctx = mapViewController
      .propOf($METHOD_COLLECTION)
      .propOf(methodCollectionName)
      .getData()

    return ctx
  }
}

class MapManager {
  constructor() {
    this.isInCharge = false
    this.loadedDefaultModules = false
    this.gisConstructor = {}
    this.registeredData = new RegisteredData({
      [$CHARGING_MAPS]: []
    })
  }

  charge(mapView, { attributes, name } = {}) {
    ++mapViewId
    const id = `mapView_${mapViewId}`
    name = name || id

    if (this.at(name)) {
      throw new Error(`[$MapManager]: mapView name existed: "${name}"`)
    }

    // 预先加载一些常用模块
    if (!this.loadedDefaultModules) {
      this.loadGisConstructor([
        { path: 'esri/Graphic', name: 'Graphic' },
        { path: 'esri/widgets/Sketch/SketchViewModel', name: 'SketchViewModel' },
        { path: 'esri/layers/GraphicsLayer', name: 'GraphicsLayer' },
        { path: 'esri/geometry/Polygon', name: 'Polygon' },
        { path: 'esri/geometry/Polyline', name: 'Polyline' },
        { path: 'esri/geometry/Point', name: 'Point' },
        { path: 'esri/geometry/geometryEngine', name: 'geometryEngine' }
      ]).catch((err) => {
        this.loadedDefaultModules = false
        console.error(err)
      })

      this.loadedDefaultModules = true
    }

    this.isInCharge = true

    const mapViewController = new RegisteredData({
      [$METHOD_COLLECTION]: new RegisteredData(),
      [$TYPE]: MAP_VIEW_CONTROLLER,
      [$ID]: id,
      [$MAP_VIEW_NAME]: name,
      [$MAP_VIEW]: mapView,
      [$ATTRIBUTES]: attributes,
      [$MAP_MANAGER]: this,
      [$GIS_CONSTRUCTOR]: this.gisConstructor
    })

    mapViewController.add({
      execute: (...args) => {
        return this.execute(mapViewController, ...args)
      }
    })

    this.registeredData
      .propOf($CHARGING_MAPS)
      .push(mapViewController)
  }

  showChargingMaps() {
    return this.registeredData
      .propOf($CHARGING_MAPS)
      .map(item => item[$MAP_VIEW_NAME])
  }

  dispose() {
    this.isInCharge = false
    this.loadedDefaultModules = false
    this.registeredData = new RegisteredData({
      [$CHARGING_MAPS]: []
    })

    Object.keys(this.gisConstructor).forEach(key => {
      delete this.gisConstructor[key]
    })
  }

  ifInCharge(cb) {
    const isInCharge = this.isInCharge

    if (cb) {
      if (isInCharge) {
        return cb()
      } else {
        throw new Error('[$MapManager] method has not been called: charge')
      }
    }

    return isInCharge
  }

  at(mapViewName) { // 获取mapview控制对象
    const selectedMap = this.registeredData
      .propOf($CHARGING_MAPS)
      .find(mapViewController => mapViewController.propOf($MAP_VIEW_NAME) === mapViewName)

    return selectedMap && selectedMap.getData()
  }

  /**
   * 调用注册的地图方法
   */
  execute(method, ...args) {
    return this.ifInCharge(() => {
      const mapManagerDataStore = this.registeredData.getData()
      const [mapViewController, methodName, newArgs] = EXECUTION_PROCESS.getCondition(mapManagerDataStore, method, args)
      const [fn, origMethodCollection] = EXECUTION_PROCESS.matchMethod(mapManagerDataStore, methodName)

      if (!fn) {
        throw new Error(`[$MapManager] method not found: ${methodName}`)
      }

      if (!(fn instanceof Function)) {
        throw new Error(`[$MapManager] not a method: ${methodName}`)
      }

      const ctx = EXECUTION_PROCESS.getMethodCtx(mapViewController, origMethodCollection)

      return fn.call(ctx, ...newArgs)
    })
  }

  /**
   * 加载gis模块
   * @param {Array<{ name, path }>} paths
   */
  loadGisConstructor(paths) {
    paths = paths.filter(item => {
      let hasThisConstructor = !!this.gisConstructor[item.name]

      if (hasThisConstructor) {
        console.warn(`[loadGisConstructor]: module name existed: ${item.name}`)
      }

      return !hasThisConstructor
    })

    return loadModules(paths.map(item => item.path)).then(constructors => {
      constructors.forEach((item, index) => {
        this.gisConstructor[paths[index].name] = item
      })
    })
  }

  /**
   *
   * @param {object} methodCollection -注册数据和方法
   * @param {string} methodCollectionName -注册数据和方法的存放位置，默认放在global
   */
  register(methodCollection, methodCollectionName) {
    const registeredData = this.registeredData
    methodCollectionName = methodCollectionName || 'global'

    if (registeredData.propOf(methodCollectionName)) {
      throw new Error(`[$MapManager]: method collection name existed: ${methodCollectionName}`)
    }

    const { data, methods } = methodCollection
    const result = {}

    Object.assign(result, { data, methods })

    registeredData.add({
      [methodCollectionName]: new RegisteredData({
        [$METHOD_COLLECTION_NAME]: methodCollectionName,
        [$TYPE]: METHOD_COLLECTION
      })
    })

    registeredData.propOf(methodCollectionName).add(result)
  }
}

function installMapManager(Vue) {
  const $MapManager = new MapManager()

  Object.entries(DEFAULT_METHODS).forEach(([methodCollectionName, methodCollection]) => {
    $MapManager.register(methodCollection, methodCollectionName)
  })

  Vue.prototype.$MapManager = $MapManager
}

export default installMapManager
