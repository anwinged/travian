<template>
  <section>
    <h1 class="title">{{ shared.name }} - {{ villageName }}</h1>
    <p class="version">{{ shared.version }}</p>
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
  margin: 8px;
}
.version {
  font-size: 120%;
  margin: 8px;
}
</style>
