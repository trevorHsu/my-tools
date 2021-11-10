# DCImap
DCImap 是基于ArcGIS API 封装的一组工具方法，旨在简化api调用，并且它支持方法扩展。

目前支持在 Vue 上挂载。

## 必要依赖
```shell
$npm install --save esri-loader
```

## 使用步骤

### 1. 全局注册
注册后，可以在 *vue* 实例中调用 *DCImap*，通过 *this.$DCImap.execute(methodName, ...args)* 实现调用
```js
registerDCImap(Vue)
```

### 2. 在地图的MapView实例初始化后，初始化DCImap
```js
const view = new MapView(...)

this.$DCImap.init({
  mapView: view,
  vue: this.$root
})
```

### 3. 调用地图方法
```js
this.$DCImap.execute('methodName', ...args)
```

<hr />


## 注册地图方法
统一在 *./index.js* 中注册地图方法，供$DCImap调用

示例：

```js
// 地图方法配置 mapMethod.js
export default {
  data() {
    return {
      info: 'hello'
    }
  },
  methods: {
    showInfo() {
      /*
        this: {
          $DCImap,
          $mapView,
          $vue,
          $gisConstructor
          ...本配置中的属性和方法
        }
      */
      console.log('showInfo', this.info)
    }
  }
}
```

```js
// 注册地图方法
import mapMethod from './mapMethod'

const META_DATA = {
  mapMethod
}
```


## 加载 ESRI 模块
```js
// 通过 $gisConstructor 属性访问已经加载的模块
this.$DCImap.loadGisConstructor([
  { path: 'esri/Graphic', name: 'Graphic' }
]) 
```
