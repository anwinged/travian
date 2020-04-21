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
          <tr class="normal-line top-line">
            <td :class="{ active: village.active }" :title="village.id">{{ village.name }}</td>
            <td class="right">
              <filling :value="village.lumber" :max="village.warehouse" :speed="village.lumber_hour"></filling>
            </td>
            <td class="right">
              <filling :value="village.clay" :max="village.warehouse" :speed="village.clay_hour"></filling>
            </td>
            <td class="right">
              <filling :value="village.iron" :max="village.warehouse" :speed="village.iron_hour"></filling>
            </td>
            <td class="right">
              <filling :value="village.crop" :max="village.granary" :speed="village.crop_hour"></filling>
            </td>
            <td class="right">
              <a :href="warehousePath(village)" v-text="village.warehouse"></a>
            </td>
            <td class="right" v-text="village.granary"></td>
          </tr>
          <tr class="performance-line">
            <td class="right">Прирост:</td>
            <td class="right">+{{ village.lumber_hour }}</td>
            <td class="right">+{{ village.clay_hour }}</td>
            <td class="right">+{{ village.iron_hour }}</td>
            <td class="right">+{{ village.crop_hour }}</td>
            <td></td>
            <td></td>
          </tr>
          <tr class="required-line">
            <td class="right">След:</td>
            <td class="right" v-text="village.lumber_need || ''"></td>
            <td class="right" v-text="village.clay_need || ''"></td>
            <td class="right" v-text="village.iron_need || ''"></td>
            <td class="right" v-text="village.crop_need || ''"></td>
            <td class="right" v-text="secondsToTime(village.buildRemainingSeconds)"></td>
            <td></td>
          </tr>
          <tr class="required-line">
            <td class="right">Баланс:</td>
            <td class="right">
              <resource :value="village.lumber - (village.lumber_need || 0)"></resource>
            </td>
            <td class="right">
              <resource :value="village.clay - (village.clay_need || 0)"></resource>
            </td>
            <td class="right">
              <resource :value="village.iron - (village.iron_need || 0)"></resource>
            </td>
            <td class="right">
              <resource :value="village.crop - (village.crop_need || 0)"></resource>
            </td>
            <td class="right" v-text="timeToRequired(village)"></td>
            <td></td>
          </tr>
          <tr class="required-line">
            <td class="right">Баланс очереди:</td>
            <td class="right">
              <resource :value="village.lumber - village.lumber_total_need"></resource>
            </td>
            <td class="right">
              <resource :value="village.clay - village.clay_total_need"></resource>
            </td>
            <td class="right">
              <resource :value="village.iron - village.iron_total_need"></resource>
            </td>
            <td class="right">
              <resource :value="village.crop - village.crop_total_need"></resource>
            </td>
            <td class="right" v-text="timeToTotalRequired(village)"></td>
            <td></td>
          </tr>
          <tr class="normal-line">
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
import { path } from '../utils';
import ResourceBalance from './ResourceBalance';
import VillageResource from './VillageResource';

export default {
  components: {
    resource: ResourceBalance,
    filling: VillageResource,
  },
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
    secondsToTime(value) {
      if (value === 0) {
        return '';
      }
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      const seconds = Math.floor(value % 60);
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },
    secondsToRequiredTime(value) {
      if (value === -1) {
        return 'never';
      }
      return this.secondsToTime(value);
    },
    timeToRequired(village) {
      return this.secondsToRequiredTime(village.timeToRequired());
    },
    timeToTotalRequired(village) {
      return this.secondsToRequiredTime(village.timeToTotalRequired());
    },
  },
};
</script>

<style scoped>
.village-table {
  width: 100%;
  border-collapse: collapse;
}

.top-line td {
  border-top: 1px solid #ddd;
}

.normal-line td {
  padding: 4px;
}

.filling-line td {
  padding: 0;
  border: 1px solid #ddd;
}

.performance-line td {
  padding: 0 4px 4px;
  font-size: 90%;
}

.required-line td {
  padding: 0 4px 4px;
  font-size: 90%;
}

.village-table td.active {
  font-weight: bold;
}

.right {
  text-align: right;
}

.village-quick-link {
  display: inline-block;
}

.village-quick-link + .village-quick-link {
  margin-left: 0.4em;
}
</style>
