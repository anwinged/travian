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
            <td
              class="right"
              v-text="village.lumber"
              :title="resourceTitle(village.lumber, village.warehouse, village.lumber_hour)"
            ></td>
            <td
              class="right"
              v-text="village.clay"
              :title="resourceTitle(village.clay, village.warehouse, village.clay_hour)"
            ></td>
            <td
              class="right"
              v-text="village.iron"
              :title="resourceTitle(village.iron, village.warehouse, village.iron_hour)"
            ></td>
            <td
              class="right"
              v-text="village.crop"
              :title="resourceTitle(village.crop, village.granary, village.crop_hour)"
            ></td>
            <td class="right">
              <a :href="warehousePath(village)" v-text="village.warehouse"></a>
            </td>
            <td class="right" v-text="village.granary"></td>
          </tr>
          <tr class="required-line">
            <td class="right">След:</td>
            <td class="right" v-text="village.lumber_need || ''"></td>
            <td class="right" v-text="village.clay_need || ''"></td>
            <td class="right" v-text="village.iron_need || ''"></td>
            <td class="right" v-text="village.crop_need || ''"></td>
            <td></td>
            <td></td>
          </tr>
          <tr class="required-line">
            <td class="right">Профицит:</td>
            <td class="right" v-text="village.lumber - village.lumber_need || ''"></td>
            <td class="right" v-text="village.clay - village.clay_need || ''"></td>
            <td class="right" v-text="village.iron - village.iron_need || ''"></td>
            <td class="right" v-text="village.crop - village.crop_need || ''"></td>
            <td></td>
            <td></td>
          </tr>
          <tr class="performance-line">
            <td class="right" v-text="secondsToTime(village.buildRemainingSeconds)"></td>
            <td class="right">+{{ village.lumber_hour }}</td>
            <td class="right">+{{ village.clay_hour }}</td>
            <td class="right">+{{ village.iron_hour }}</td>
            <td class="right">+{{ village.crop_hour }}</td>
            <td></td>
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
    resourceTitle(current, max, speed) {
      const percent = Math.floor((current / max) * 100);
      if (speed < 0) {
        const time = this.fractionalHourToTime(current / speed);
        return `${current}, ${percent}%, опустеет через ${time}`;
      } else {
        const time = this.fractionalHourToTime((max - current) / speed);
        return `${current}, ${percent}%, заполнится через ${time}`;
      }
    },
    fractionalHourToTime(value) {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}:${String(minutes).padStart(2, '0')}`;
    },
    secondsToTime(value) {
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      const seconds = value % 60;
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },
  },
};
</script>

<style scoped>
.village-table {
  width: 100%;
  border-collapse: collapse;
}

.normal-line td {
  padding: 4px;
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

.top-line td {
  border-top: 1px solid #ddd;
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
