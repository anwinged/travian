<template>
  <tr>
    <td class="status-line" colspan="7">
      режим
      <a href="#" v-text="settings.receiveResourcesMode" v-on:click.prevent="toggleMode()"></a>,
      <span v-text="status"></span>
      |
      <a class="village-quick-link" :href="quartersPath(villageState.village)">Казармы</a>
      <a class="village-quick-link" :href="horseStablePath(villageState.village)">Конюшни</a>
      <a class="village-quick-link" :href="collectionPointPath(villageState.village)">Войска</a>
    </td>
  </tr>
</template>

<script>
import { Actions } from './Store';
import { path } from '../Helpers/Path';
import { COLLECTION_POINT_ID, HORSE_STABLE_ID, QUARTERS_ID } from '../Core/Buildings';

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
    collectionPointPath(village) {
      return path('/build.php', { newdid: village.id, gid: COLLECTION_POINT_ID, tt: 1 });
    },
    quartersPath(village) {
      return path('/build.php', { newdid: village.id, gid: QUARTERS_ID });
    },
    horseStablePath(village) {
      return path('/build.php', { newdid: village.id, gid: HORSE_STABLE_ID });
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
  @extend %small-cell;
}
</style>
