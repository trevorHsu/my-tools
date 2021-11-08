# CommonPopupPanel
a global popup panel for Vue


# Usage

## global import
```js
// installation
import CommonPopupPanel from './CommonPopupPanel'
Vue.use(CommonPopupPanel)

// in vue instance
{
  methods: {
    open() {
      const options = {}
      this.$commonPopupPanel(options)
    }
  }
}
```

## local import
```js
import { createCommonPopupPanel } from './CommonPopupPanel'

const options = {}
createCommonPopupPanel(options)
```

# Options
| Field | Type | Description | Default |
|:-:|:-:|:-:|:-|
|title|string|panel title|-|
|panel|VNode|popup panel's content|-|
|props|object|vue props that will pass into panel's content|-|
|id|string|popup panel's id;<br/> if it is not undefined or false, the popup panel with the same id can not exist simultaneously |-|
|root|string|css selector of the popup panel's parent DOM|#app|
|styleObj|object|css style of the popup panel|{<br/>&nbsp;&nbsp;&nbsp;&nbsp; left: '40px',<br/>&nbsp;&nbsp;&nbsp;&nbsp; top: '140px',<br/>&nbsp;&nbsp;&nbsp;&nbsp; height: '300px',<br/>&nbsp;&nbsp;&nbsp;&nbsp; width: '400px'<br/> }|
