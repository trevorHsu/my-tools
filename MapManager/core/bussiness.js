export default {
  methods: {
    geometryToJson(geometry) {
      if (geometry.constructed) {
        geometry = Object.assign(
          { type: geometry.type, spatialReference: { wkid: geometry.spatialReference.wkid } },
          geometry.toJSON()
        )
      }

      return geometry
    },
    standardGeojsonToEsriGeojson(geometry) {
      let spatialReference = {
        wkid: this.$mapView.spatialReference.wkid
      }
      let shpType = geometry.type ? (geometry.type).toLowerCase() : ''
      let coordinates = geometry.coordinates
      let result = {}

      if (shpType.indexOf('point') !== -1) {
        result = {
          type: 'point',
          x: coordinates[0],
          y: coordinates[1]
        }
      } else if (shpType.indexOf('line') !== -1) {
        result = {
          type: 'polyline',
          paths: coordinates
        }
      } else if (shpType.indexOf('polygon') !== -1) {
        result = {
          type: 'polygon',
          rings: coordinates[0]
        }
      }

      Object.assign(result, { spatialReference })

      return result
    },
    getGeometryLength(geometry) { // 最终结果的单位是米 meter
      const ESRI = this.$gisConstructor
      let length = 0

      try {
        length = ESRI.geometryEngine.planarLength(geometry) * 100 * 1000
      } catch (err) {
        console.error('[getGeometryLength]: ', err)
      }

      return length.toFixed(2)
    },
    getGeometryArea(geometry) { // 最终结果的单位是平方米 square meter
      const ESRI = this.$gisConstructor
      let area = 0

      try {
        area = ESRI.geometryEngine.planarArea(geometry) * 10000 * 1000000
      } catch (err) {
        console.error('[getGeometryArea]: ', err)
      }

      return area.toFixed(2)
    }
  }
}
