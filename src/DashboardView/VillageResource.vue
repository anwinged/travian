<template>
  <span :class="classes" :title="title" v-text="formatted"></span>
</template>

<script>
export default {
  props: ['value', 'max', 'speed'],
  data() {
    return {};
  },
  computed: {
    formatted() {
      return this.value;
    },
    percent() {
      return Math.floor((this.value / this.max) * 100);
    },
    title() {
      if (this.speed < 0) {
        const time = this.fractionalHourToTime(this.value / this.speed);
        return `${this.value}, ${this.percent}%, опустеет через ${time}`;
      } else {
        const time = this.fractionalHourToTime((this.max - this.value) / this.speed);
        return `${this.value}, ${this.percent}%, заполнится через ${time}`;
      }
    },
    classes() {
      return {
        warning: this.percent >= 70 && this.percent < 95,
        bad: this.percent >= 95,
      };
    },
  },
  methods: {
    fractionalHourToTime(value) {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}:${String(minutes).padStart(2, '0')}`;
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
