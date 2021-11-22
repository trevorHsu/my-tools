<template>
  <DragDiv
    :parentElement="parentElement"
    :class="['drag-panel', expand ? '' : 'mini']"
  >
    <template v-slot:dragHeader>
      <div class="drag-panel-header">
        <slot name="title">
          <div class="header-title-text">
            {{ title }}
          </div>

          <i v-show="closable" class="panel-header-icon icon-del" @click="handleClose"></i>
          <i v-show="!noExpand" :class="`panel-header-icon icon-${expand ? 'shrink' : 'expand'}`" @click="expand = !expand" />
        </slot>
      </div>
    </template>

    <template v-slot:dragContainer>
      <div class="drag-panel-container">
        <slot />
      </div>
    </template>

      <!-- <template v-slot:dragFooter>
        <slot name="footer" />
      </template> -->
  </DragDiv>
</template>

<script>
import DragDiv from './DragDiv'

export default {
  name: 'drag-panel',
  components: { DragDiv },
  props: {
    parentElement: {
      required: true,
      type: String,
      default: ''
    },
    title: String,
    closable: {
      type: Boolean,
      default: false
    },
    noExpand: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      expand: true
    }
  },
  methods: {
    handleClose() {
      this.closable && this.$emit('close')
    }
  }
}
</script>

<style scoped>
.drag-panel {
  overflow: hidden;
  max-height: 100%;
  max-width: unset;
  transition: max-height .2s, max-width .3s, opacity .22s, box-shadow .2s, transform .3s;
  box-shadow: 0 0 24px 0 rgba(160,170,199,0.29);
  background-color: #fff;
  z-index: 999;
}

.drag-panel .drag-panel-header {
  width: 100%;
  box-sizing: border-box;
  height: 40px;
  line-height: 40px;
  padding: 0 15px;
  font-size: 14px;
  color: #fff;
  background-color: #428BDC;
  border-radius: 4px 4px 0 0;
}

.drag-panel .drag-panel-header .header-title-text {
  float: left;
}

.drag-panel .drag-panel-header .panel-header-icon {
  cursor: pointer;
  transition: .2s;
  float: right;
  margin-right: 6px;
  color: #fff;
}

.icon-del::after {
  content: url(./icon/del.svg);
  display: inline-block;
}

.icon-shrink::after {
  content: url(./icon/shrink.svg);
  display: inline-block;
}

.icon-expand::after {
  content: url(./icon/expand.svg);
  display: inline-block;
}

.drag-panel .drag-panel-container {
  opacity: 1;
  height: calc(100% - 40px);
}

.drag-panel.mini {
  max-height: 40px;
  max-width: 200px;
  background: transparent;
  opacity: .6;
  border-radius: 6px;
  transform: translateY(2px);
}

.drag-panel.mini:hover {
  box-shadow: rgba(0, 0, 0, 0.24) 1px 2px 4px 1px;
  opacity: 1;
  transform: translateY(-1px);
}

.drag-panel.mini .drag-panel-container {
  opacity: 0;
  height: 0;
  overflow: hidden;
}
</style>
