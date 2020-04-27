<template>
  <section>
    <h1 class="title">
      [{{ shared.name }}] {{ villageName }}
      <span class="version">- {{ shared.version }}</span>
      <a href="#" v-on:click.prevent="pause()">
        pause <span v-if="shared.pauseSeconds" v-text="shared.pauseSeconds"></span>
      </a>
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
      let village = this.shared.activeVillage;
      return village ? village.name : 'Unknown';
    },
  },
  methods: {
    pause() {
      this.shared.pause();
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
