<template>
  <section>
    <table class="village-table">
      <thead>
        <tr>
          <th></th>
          <th class="right">Дерево</th>
          <th class="right">Глина</th>
          <th class="right">Железо</th>
          <th class="right">Зерно</th>
          <th class="right">Склад</th>
          <th class="right">Амбар</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="village in shared.villages">
          <tr class="top-line">
            <td :class="{ active: village.active }" :title="village.id">{{ village.name }}</td>
            <td class="right" v-text="village.lumber"></td>
            <td class="right" v-text="village.clay"></td>
            <td class="right" v-text="village.iron"></td>
            <td class="right" v-text="village.crop"></td>
            <td class="right">
              <a :href="warehousePath(village)" v-text="village.warehouse"></a>
            </td>
            <td class="right" v-text="village.granary"></td>
          </tr>
          <tr>
            <td></td>
            <td class="right small">+{{ village.lumber_hour }}</td>
            <td class="right small">+{{ village.clay_hour }}</td>
            <td class="right small">+{{ village.iron_hour }}</td>
            <td class="right small">+{{ village.crop_hour }}</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td class="right" colspan="6">
              <a
                class="village-quick-link"
                v-for="v in shared.villages"
                v-if="v.id !== village.id"
                :href="marketPath(village, v)"
                :title="'Отправить ресурсы из ' + village.name + ' в ' + v.name"
                >->{{ v.name }}</a
              >
              <a class="village-quick-link" :href="quartersPath(village)">Казармы</a>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </section>
</template>

<script>
import { path } from '../../utils';

export default {
  data() {
    return {
      shared: this.$root.$data,
      activeVillage: this.$root.$data.activeVillage,
    };
  },
  methods: {
    path(name, args) {
      return path(name, args);
    },
    marketPath(fromVillage, toVillage) {
      return path('/build.php', { newdid: fromVillage.id, gid: 17, t: 5, x: toVillage.crd.x, y: toVillage.crd.y });
    },
    warehousePath(village) {
      return path('/build.php', { newdid: village.id, gid: 10 });
    },
    quartersPath(village) {
      return path('/build.php', { newdid: village.id, gid: 19 });
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
  padding: 4px;
}

.village-table td.active {
  font-weight: bold;
}

.top-line td {
  border-top: 1px solid #ddd;
}

.right {
  text-align: right;
}

.small {
  font-size: 90%;
}

.village-quick-link {
  display: inline-block;
}

.village-quick-link + .village-quick-link {
  margin-left: 0.4em;
}
</style>
