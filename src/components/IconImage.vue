<template>
  <image 
    :src="imageSrc" 
    :style="{ width: size + 'px', height: size + 'px' }" 
    mode="aspectFit"
    @click="handleClick"
    class="icon-image"
  ></image>
</template>

<script>
export default {
  name: 'IconImage',
  props: {
    type: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 24
    }
  },
  computed: {
    imageSrc() {
      return `/static/icons/${this.type}.png`;
    }
  },
  methods: {
    handleClick(e) {
      this.$emit('click', e);
    }
  }
}
</script>

<style>
.icon-image {
  flex-shrink: 0;
}
</style> 