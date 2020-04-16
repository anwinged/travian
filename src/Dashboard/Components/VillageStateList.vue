<template>
  <section>
    <table class="village-table">
      <tr v-for="village in shared.villages" :key="village.id">
        <td :class="{ active: village.active }">{{ village.id }} - {{ village.name }}</td>
        <td>Д: {{ resources(village.id).lumber }}</td>
        <td>Г: {{ resources(village.id).clay }}</td>
        <td>Ж: {{ resources(village.id).iron }}</td>
        <td>З: {{ resources(village.id).crop }}</td>
        <td>
          <a
            v-if="village.id !== activeVillageId"
            :href="path('/build.php', { newdid: activeVillageId, gid: 17, t: 5, x: village.crd.x, y: village.crd.y })"
            :title="'Отправить ресурсы в ' + village.name"
            >РЕС</a
          >
        </td>
      </tr>
    </table>
  </section>
</template>

<script>
import { path } from '../../utils';

export default {
  data() {
    return {
      shared: this.$root.$data,
    };
  },
  computed: {
    activeVillageId() {
      return this.shared.village.id;
    },
  },
  methods: {
    resources(id) {
      return this.shared.getVillageResources(id);
    },
    path(name, args) {
      return path(name, args);
    },
  },
};
</script>

<style scoped>
.village-table {
  width: 100%;
  border-collapse: collapse;
}

.village-table td {
  border-top: 1px solid #ddd;
  padding: 4px;
}

.village-table td.active {
  font-weight: bold;
}
</style>
