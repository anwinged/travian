<template>
  <span :class="classes" v-text="formatted"></span>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
    },
    hideZero: {
      type: Boolean,
      default: false,
    },
    color: {
      type: Boolean,
      default: true,
    },
    sign: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    formatted() {
      if (this.value === undefined) {
        return '';
      }
      if (this.value === 0) {
        return this.hideZero ? '' : '0';
      }
      if (this.value > 0) {
        return (this.sign ? '+' : '') + this.value;
      } else {
        return '' + this.value;
      }
    },
    classes() {
      const colorClasses = {
        good: this.value > 0,
        bad: this.value < 0,
      };
      return this.color ? colorClasses : {};
    },
  },
};
</script>

<style scoped>
.good {
  color: green;
}
.bad {
  color: red;
}
</style>
