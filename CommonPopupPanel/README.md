# CommonPopupPanel
a global popup panel for Vue


# Usage

## global import
```js
import Vue from 'Vue'
import CommonPopupPanel from './CommonPopupPanel'

// installation way 1
Vue.use(CommonPopupPanel)

// installation way 2
const defaultOptions = {...}
Vue.use(CommonPopupPanel(defaultOptions))

// in vue template
export default {
  methods: {
    open() {
      const options = {}
      this.$commonPopupPanel(options)
    }
  }
}
```

# Options
| Field | Type | Description | Default |
|:-:|:-:|:-:|:-|
|title|string|panel title|-|
|panel|VNode|popup panel's content|-|
|props|object|vue props that will pass into panel's content|-|
|id|string|popup panel's id;<br/> if it is not undefined or false, the popup panel with the same id can not exist simultaneously |-|
|el|string <br> HTMLElement|css selector or DOM of the popup panel's parent HTML element|#app|
|styleObj|object|css style of the popup panel|{<br/>&nbsp;&nbsp;&nbsp;&nbsp; left: '40px',<br/>&nbsp;&nbsp;&nbsp;&nbsp; top: '140px',<br/>&nbsp;&nbsp;&nbsp;&nbsp; height: '300px',<br/>&nbsp;&nbsp;&nbsp;&nbsp; width: '400px'<br/> }|


# Q & A
## How to get panel's outer Vue instance?
CommonPopupPanel will create a new Vue isntance, so it is isolated from its parent Vue instance or outer Vue instance. It means that you cannot access the outer Vue instance's properties directly, such as *$store*, *$route*.

CommonPopupPanel provides a property *$invoker* for getting its invoker object, normally it is the panel's outer Vue instance. Children VNodes of the panel can use ```inject: ['$invoker']``` to append this property to themseleves to access the outer Vue instance.
