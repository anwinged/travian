<template>
  <tr>
    <td class="status-line" colspan="7">
      режим
      <a href="#" v-text="settings.receiveResourcesMode" v-on:click.prevent="toggleMode()"></a>,
      <span v-text="status"></span>
    </td>
  </tr>
</template>

<script>
import { Actions } from './Store';

export default {
  props: {
    villageState: {
      type: Object,
    },
  },
  computed: {
    settings() {
      return this.villageState.settings;
    },
    status() {
      const settings = this.villageState.settings;
      const threshold = settings.sendResourcesThreshold;
      const multiplier = settings.sendResourcesMultiplier;
      return `порог ${threshold}, множ. ${multiplier}`;
    },
  },
  methods: {
    toggleMode() {
      const villageId = this.villageState.id;
      this.$store.dispatch(Actions.ToggleVillageReceiveMode, { villageId });
    },
  },
};
</script>

<style scoped lang="scss">
%right {
  text-align: right;
}
%small-cell {
  padding: 0 4px 4px;
  font-size: 90%;
}
.status-line {
  @extend %right;
}
</style>
