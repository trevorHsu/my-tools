<!--
  全局公共弹窗
-->
<template>
  <DragPanel tabindex="1" ref="panel" :id="id" class="common-popup-panel"
    @close="handleClose"
    :title="title" closable
    :style="panelStyle"
    :parentElement="parentElement"
  >
    <div class="padding-box">
      <div class="content">
        <PanelContent />
      </div>
    </div>
  </DragPanel>
</template>

<script>
import { mapState } from 'vuex'
import DragPanel from './DragPanel'

const DEFAULT_HEIGHT = '300PX'

export default {
  name: 'common-popup-panel',
  components: {
    DragPanel,
    PanelContent: {
      functional: true,
      render(h, ctx) {
        const _this = ctx.parent
        let PanelContent = _this.panel || ''

        if (PanelContent) {
          PanelContent.componentOptions.propsData = _this.props
        }

        return PanelContent
      }
    }
  },
  data() {
    return {
      id: `CommonPopupPanel_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    }
  },
  props: {
    panel: Object,
    title: String,
    styleObj: Object,
    props: Object,
    parentElement: String
  },
  computed: {
    panelStyle() {
      let style = {
        width: '400px',
        left: '40px',
        top: '140px',
        height: DEFAULT_HEIGHT
      }

      this.styleObj && Object.assign(style, this.styleObj)

      return style
    }
  },
  methods: {
    handleClose() {
      this.$refs.panel.$el.remove()
      this.$root.$destroy()
    }
  }
}
</script>

<style lang="scss" scoped>
.common-popup-panel {
  position: absolute;
  outline: none;
  z-index: 999;

  &:focus-within {
    z-index: 9999;
  }

  .padding-box {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 4px;

    .content {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border: 1px solid #e4e4e4;
      border-radius: 2px;
      padding: 4px;
    }
  }

}
</style>
