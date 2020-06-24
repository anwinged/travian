<template>
  <section class="header">
    <div class="into-block">
      <h1 class="title">
        [{{ shared.name }}] {{ villageName }}
        <span class="version">- {{ shared.version }}</span>
      </h1>
    </div>
    <div class="actions-block">
      <a href="#" v-on:click.prevent="pause">
        pause
        <span
          v-if="shared.pauseSeconds && shared.pauseSeconds > 0"
          v-text="shared.pauseSeconds"
        ></span>
      </a>
      <a href="#" v-on:click.prevent="toggleLogs">logs</a>
    </div>
  </section>
</template>

<script>
import { Mutations } from './Store';

export default {
  data() {
    return {
      shared: this.$root.$data,
    };
  },
  computed: {
    villageName() {
      let state = this.shared.activeVillageState;
      return state ? state.village.name : 'Unknown';
    },
  },
  methods: {
    pause() {
      this.shared.pause();
    },
    toggleLogs() {
      this.$store.commit(Mutations.toggleLogs);
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.into-block {
}
.actions-block {
}
.title {
  font-size: 160%;
  padding-top: 8px;
  margin-bottom: 8px;
}
.version {
  font-size: 14px;
}
</style>
