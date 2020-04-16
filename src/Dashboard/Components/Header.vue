<template>
  <section>
    <h1 class="title">
      [{{ shared.name }}] {{ villageName }}
      <span class="version">- {{ shared.version }}</span>
    </h1>
  </section>
</template>

<script>
export default {
  data() {
    return {
      shared: this.$root.$data,
    };
  },
  computed: {
    villageName() {
      let village = this.shared.village;
      return village ? village.name : 'Unknown';
    },
  },
};
</script>

<style scoped>
.title {
  font-size: 160%;
  padding-top: 8px;
  margin-bottom: 8px;
}
.version {
  font-size: 14px;
}
</style>
