// 地图基础操作
const GeometryServiceURL = ''

const getDefaultHighlightStyle = function(geometry) {
  const type = geometry.type
  const defaultStyle = {
    point: {
      type: 'simple-marker',
      style: 'circle',
      size: 10,
      color: [255, 255, 0],
      outline: {
        color: [255, 255, 255, 0.5],
        width: 6
      }
    },
    polyline: {
      type: 'simple-line',
      color: [220, 230, 83],
      width: 4
    },
    polygon: {
      type: 'simple-fill',
      color: [249, 245, 189],
      outline: {
        color: [220, 230, 83],
        width: 4
      }
    },
    default: {
      type: 'simple-fill',
      color: [249, 245, 189],
      outline: {
        color: [220, 230, 83],
        width: 4
      }
    }
  }

  return defaultStyle[type] || defaultStyle.default
}


export default {
  data () {
    return {
      flashGraphicLayer: null
    }
  },
  methods: {
    hightlightFeature (grahicData, { duration = 3000, enableGoTo = true } = {}, cb) {
      const view = this.$mapView
      const ESRI = this.$gisConstructor

      this.stopFlashLayer()

      this.flashGraphicLayer = new ESRI.GraphicsLayer()
      view.map.add(this.flashGraphicLayer, 99999)

      const newGraphicData = { ...grahicData }

      // 默认样式
      if (!newGraphicData.symbol) {
        newGraphicData.symbol = getDefaultHighlightStyle(newGraphicData.geometry)
      }
      //

      const grahic = this.constructGraphic(newGraphicData)

      this.flashGraphicLayer.add(grahic)
      enableGoTo && this.goTo(grahic)
      this.flashLayer(this.flashGraphicLayer, duration, layer => {
        layer && layer.removeAll()
      })
    },
    stopFlashLayer() {
      const view = this.$mapView
      clearTimeout(this.flashLayer._t)

      if (this.flashGraphicLayer) {
        this.flashGraphicLayer.removeAll()
        view.map.remove(this.flashGraphicLayer)
        this.flashGraphicLayer = null
      }
    },
    flashLayer (layer, duration = 2000, cb) {
      let t = 0
      let direction = 1 // 步进方向，1为增，-1为减
      const delay = 10
      const step = 0.03 // 每delay毫秒步进值
      clearTimeout(this.flashLayer._t)
      const loop = () => {
        if (t < duration) {
          t += delay
          nextStep()
          this.flashLayer._t = setTimeout(loop, delay)
        } else {
          if (layer.opacity < 1) {
            nextStep()
            this.flashLayer._t = setTimeout(loop, delay)
          }

          cb && cb(layer)
        }
      }

      function nextStep () {
        if (layer.opacity === 1) {
          direction = -1
        } else if (layer.opacity === 0) {
          direction = 1
        }
        layer.opacity += direction * step
      }

      loop()
    },
    goTo (target, options) {
      this.$mapView.goTo(target, options)
      // this.$mapView.goTo({
      //   target: viewpoint,
      //   ...options
      // })
    },
    goToGeometry (obj, cb) {
      if (typeof obj === 'string' || obj.geometry || obj.type) {
        obj = this.constructGeometry(obj)
      } else if (obj instanceof Array) {
        obj = obj.map(d => this.constructGeometry(d))
      }

      this.$mapView.goTo(obj, { duration: 1000 })
        .then(() => {
          cb && cb()
        })
    },
    constructGraphic (data) {
      const ESRI = this.$gisConstructor
      const geometryData = typeof data === 'string' ? JSON.parse(data) : data

      let geometry = geometryData.geometry.constructed
        ? geometryData.geometry
        : this.constructGeometry(geometryData.geometry)
      let symbol = geometryData.symbol
      let attributes = geometryData.attributes // 需要图形携带的信息可以放在该属性下
      let popupTemplate = geometryData.popupTemplate

      if (!geometry.spatialReference) {
        geometry.spatialReference = this.$mapView.spatialReference
      }

      let result = new ESRI.Graphic({
        geometry, symbol, attributes, popupTemplate
      })

      return result
    },
    constructGeometry (data) {
      const ESRI = this.$gisConstructor
      let geometry = typeof data === 'string' ? JSON.parse(data) : data

      if (!geometry.spatialReference) {
        geometry = Object.assign({
          spatialReference: this.$mapView.spatialReference
        }, geometry)
      }

      if (geometry.type === 'point') {
        return new ESRI.Point(geometry)
      } else if (geometry.type === 'polyline') {
        return new ESRI.Polyline(geometry)
      } else if (geometry.type === 'polygon') {
        return new ESRI.Polygon(geometry)
      } else {
        return new ESRI.Point()
      }
    },
    async getGeometryBuffer ({ geometry, distance, unit = 'meters' }) {
      const isArrayGeo = geometry instanceof Array
      const ESRI = this.$gisConstructor
      const GeometryService = new ESRI.GeometryService({
        url: GeometryServiceURL
      })
      let geometries = isArrayGeo
        ? geometry.map(item => this.constructGeometry(item))
        : [this.constructGeometry(geometry)]
      let geoSpatialReference = geometries[0].spatialReference

      const params = new ESRI.BufferParameters({
        distances: [distance],
        unit,
        geodesic: true,
        spatialReference: geoSpatialReference,
        bufferSpatialReference: geoSpatialReference,
        outSpatialReference: geoSpatialReference,
        geometries,
        unionResults: false
      })

      try {
        const res = await GeometryService.buffer(params)
        return isArrayGeo ? res : res[0]
      } catch (err) {
        console.log(err)
      }
    },
    simplifyGeometry (geometry) {
      const ESRI = this.$gisConstructor

      return ESRI.geometryEngine.simplify(geometry)
    }
  }
}
