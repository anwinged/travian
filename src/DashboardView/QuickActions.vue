<template>
  <ul class="actions">
    <li v-for="action in actions">
      <a href="#" v-on:click.prevent="onAction(action.cb)">{{ action.label }}</a>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      shared: this.$root.$data,
    };
  },
  computed: {
    actions() {
      return this.shared.quickActions;
    },
  },
  methods: {
    onAction(cb) {
      cb();
    },
  },
};
</script>

<style scoped>
.actions {
  margin: 10px auto;
  padding-inline-start: 20px;
}
</style>
