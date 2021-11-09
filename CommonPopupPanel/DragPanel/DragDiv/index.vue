<template>
  <div class="drag-content">
    <div draggable="true" v-drag:parent="parentElement">
      <slot name="dragHeader" />
    </div>
    <slot name="dragContainer" />
    <slot name="dragFooter"/>
  </div>
</template>
<script>
export default {
  name: 'DragDiv',
  props: ['parentElement'],
  data() {
    return {}
  },
  directives: {
    drag: {
      //inserted表示被绑定元素插入父节点时调用。只调用了一次
      inserted(el, bindings) {
        // 获取规定范围的dom元素
        function getParentDom(parentDom) {
          if (typeof parentDom === 'string') {
            return document.querySelector(parentDom)
          }
          return parentDom
        }
        let parentDom = getParentDom(bindings.value) // 规定活动范围的dom元素
        let CurrentDiv = el //当前元素
        let parentDiv = el.parentNode // 可拖拽元素的根元素
        let isMouseDown = false
        CurrentDiv.onmousedown = function (e) {
          // 鼠标的手型
          CurrentDiv.style.cursor = 'move'
          isMouseDown = true
          if (parentDom === null) {
            parentDom = getParentDom(parentDom)
          } else {
            //记录原始坐标
            let disX = e.clientX
            let disY = e.clientY
            document.onmousemove = function (event) {
              if (isMouseDown) {
                //计算规定范围内Dom元素的宽高度
                let parentDomWidth = parentDom.offsetWidth
                let parentDivWidth = parentDiv.offsetWidth
                let parentDomHeight = parentDom.offsetHeight
                let parentDivHeight = parentDiv.offsetHeight
                //返回规定活动范围的dom元素的大小及其相对于视口的位置
                let parentDomClientRect = parentDom.getBoundingClientRect()
                let parentDomPositionLeft = parentDomClientRect.left
                let parentDomPositionRight = parentDomClientRect.right
                let parentDomPositionTop = parentDomClientRect.top
                let parentDomPositionBottom = parentDomClientRect.bottom
                // //返回可拖拽元素的范围的dom元素的大小及其相对于视口的位置
                let parentDivClientRect = parentDiv.getBoundingClientRect()
                let parentDivPositionLeft = parentDivClientRect.left
                let parentDivPositionRight = parentDivClientRect.right
                let parentDivPositionBottom = parentDivClientRect.bottom
                let startX = event.clientX
                let startY = event.clientY
                //拖拽元素的相对偏移量
                let parentDivOffLeft = parentDiv.offsetLeft
                let parentDivOffTop = parentDiv.offsetTop
                //通过事件委托，计算移动的距离
                let l = startX - disX
                let t = startY - disY
                //左右拖拽
                parentDiv.style.left = parentDivOffLeft + l + 'px'
                //上下拖拽
                parentDiv.style.top = parentDivOffTop + t + 'px'
                // 猛拖修正
                //猛拖左边后的相对视口的位置
                if (parentDivPositionLeft < parentDomPositionLeft) {
                  parentDiv.style.left = parentDomPositionLeft + 'px'
                }
                //猛拖右边后的相对视口的位置
                if (parentDivPositionRight - 1 > parentDomPositionRight) {
                  parentDiv.style.left = parentDomWidth - parentDivWidth + parentDomPositionLeft + 'px'
                }
                //猛拖顶部后的相对视口的位置
                if (parentDivPositionBottom - 1 > parentDomPositionBottom) {
                  parentDiv.style.top = parentDomHeight - parentDivHeight + 'px'
                }
                //猛拖顶部边后的相对视口的位置
                let nowParentDivTop = parentDiv.getBoundingClientRect().top
                if (nowParentDivTop < parentDomPositionTop) {
                  parentDiv.style.top = 0
                }

                //每一次拖拽后都要更新上一个的坐标
                disX = startX
                disY = startY
              }
              event.preventDefault() //移动时禁用默认事件
            }
          }
          document.onmouseup = function () {
            //清空
            isMouseDown = false
            document.onmousemove = null
            document.onmousedown = null
          }
        }
      }
    }
  }

}
</script>
<style scoped>
/* position:absolute;这个还是要设的，不然拖动块定不了位置 */
.drag-content {
  position: absolute;
}
</style>
