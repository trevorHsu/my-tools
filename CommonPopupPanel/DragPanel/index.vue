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

          <i v-show="closable" class="panel-header-icon iconfont dci-del" @click="handleClose"></i>
          <i v-show="!noExpand" :class="`panel-header-icon iconfont dci-${expand ? 'shrink' : 'expand'}`" @click="expand = !expand" />
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

<style lang="scss" scoped>
.drag-panel {
  overflow: hidden;
  max-height: 100%;
  max-width: unset;
  transition: max-height .2s, max-width .3s, opacity .22s, box-shadow .2s, transform .3s;
  box-shadow: 0 0 24px 0 rgba(160,170,199,0.29);
  background-color: #fff;
  z-index: 999;

  .drag-panel-header {
    // display: flex;
    width: 100%;
    box-sizing: border-box;
    // justify-content: space-between;
    height: 40px;
    line-height: 40px;
    padding: 0 15px;
    font-size: 14px;
    color: #fff;
    background-color: #428BDC;
    border-radius: 4px 4px 0 0;

    .iconfont {
      cursor: pointer;
    }

    .header-title-text {
      display: inline-block;
    }

    .panel-header-icon {
      transition: .2s;
      float: right;
      margin-right: 6px;

      &:hover {
        text-shadow: 0 0 6px rgba(247, 249, 237,.7);
      }
    }
  }

  .drag-panel-container {
    opacity: 1;
    height: calc(100% - 40px);
  }

  &.mini {
    max-height: 40px;
    max-width: 200px;
    background: transparent;
    opacity: .6;
    // box-shadow: rgba(0, 0, 0, 0.2) 1px 1px 3px 2px;
    border-radius: 6px;
    transform: translateY(2px);

    &:hover {
      box-shadow: rgba(0, 0, 0, 0.24) 1px 2px 4px 1px;
      opacity: 1;
      transform: translateY(-1px);
    }

    // .drag-panel-header {
    //   border-radius: 6px;
    // }

    .drag-panel-container {
      opacity: 0;
      height: 0;
    }
  }
}
</style>
