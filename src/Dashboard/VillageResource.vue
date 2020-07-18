<template>
  <span :class="classes" :title="title" v-text="formatted"></span>
</template>

<script>
export default {
  props: ['value', 'warning', 'critical', 'full'],
  data() {
    return {};
  },
  computed: {
    formatted() {
      return this.value;
    },
    percent() {
      return Math.floor((this.value / this.full) * 100);
    },
    title() {
      return `тек. ${this.value} / опт. склад ${this.warning} / полн. ${this.full}, ${this.percent}%`;
    },
    classes() {
      return {
        warning: this.value >= this.warning && this.value < this.critical,
        bad: this.value >= this.critical,
      };
    },
  },
};
</script>

<style scoped lang="scss">
@import 'style';
.warning {
  color: $waring-color;
}
.bad {
  color: $error-color;
}
</style>
