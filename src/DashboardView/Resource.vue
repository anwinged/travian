<template>
  <span :class="classes" v-text="formatted"></span>
</template>

<script>
export default {
  props: ['value'],
  data() {
    return {};
  },
  computed: {
    formatted() {
      if (this.value === undefined) {
        return '';
      } else if (this.value > 0) {
        return '+' + this.value;
      } else {
        return '' + this.value;
      }
    },
    classes() {
      return {
        good: this.value > 0,
        bad: this.value < 0,
      };
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
