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
        <template v-for="villageState in shared.villageStates">
          <tr class="normal-line top-line">
            <td :class="{ active: villageState.village.active }" :title="villageState.id">
              {{ villageState.village.name }}
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.lumber"
                :max="villageState.storage.lumber"
                :speed="villageState.performance.lumber"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.clay"
                :max="villageState.storage.clay"
                :speed="villageState.performance.clay"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.iron"
                :max="villageState.storage.iron"
                :speed="villageState.performance.iron"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.crop"
                :max="villageState.storage.crop"
                :speed="villageState.performance.crop"
              ></filling>
            </td>
            <td class="right">
              <a :href="warehousePath(villageState.village)" v-text="villageState.storage.lumber"></a>
            </td>
            <td class="right" v-text="villageState.storage.crop"></td>
          </tr>
          <tr class="performance-line">
            <td class="right">Прирост:</td>
            <td class="right">
              <resource :value="villageState.performance.lumber"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.performance.clay"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.performance.iron"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.performance.crop"></resource>
            </td>
            <td></td>
            <td></td>
          </tr>
          <tr class="required-line">
            <td class="right">След:</td>
            <td class="right">
              <resource
                :value="villageState.required.resources.lumber"
                :hide-zero="true"
                :color="false"
                :sign="false"
              ></resource>
            </td>
            <td class="right">
              <resource
                :value="villageState.required.resources.clay"
                :hide-zero="true"
                :color="false"
                :sign="false"
              ></resource>
            </td>
            <td class="right">
              <resource
                :value="villageState.required.resources.iron"
                :hide-zero="true"
                :color="false"
                :sign="false"
              ></resource>
            </td>
            <td class="right">
              <resource
                :value="villageState.required.resources.crop"
                :hide-zero="true"
                :color="false"
                :sign="false"
              ></resource>
            </td>
            <td class="right" v-text="secondsToRequiredTime(villageState.buildRemainingSeconds)"></td>
            <td></td>
          </tr>
          <tr class="required-line">
            <td class="right">Баланс:</td>
            <td class="right">
              <resource :value="villageState.required.balance.lumber"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.required.balance.clay"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.required.balance.iron"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.required.balance.crop"></resource>
            </td>
            <td class="right" v-text="secondsToRequiredTime(villageState.required.time)"></td>
            <td></td>
          </tr>
          <tr class="required-line">
            <td class="right">Баланс очереди:</td>
            <td class="right">
              <resource :value="villageState.totalRequired.balance.lumber"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.totalRequired.balance.clay"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.totalRequired.balance.iron"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.totalRequired.balance.crop"></resource>
            </td>
            <td class="right" v-text="secondsToRequiredTime(villageState.totalRequired.time)"></td>
            <td></td>
          </tr>
          <tr class="commitments-line">
            <td class="right">Обязательства:</td>
            <td class="right">
              <resource :value="villageState.commitments.lumber" :hide-zero="true"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.commitments.clay" :hide-zero="true"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.commitments.iron" :hide-zero="true"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.commitments.crop" :hide-zero="true"></resource>
            </td>
            <td></td>
            <td></td>
          </tr>
          <tr class="incoming-line">
            <td class="right">Торговцы:</td>
            <td class="right">
              <resource :value="villageState.incomingResources.lumber" :hide-zero="true"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.incomingResources.clay" :hide-zero="true"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.incomingResources.iron" :hide-zero="true"></resource>
            </td>
            <td class="right">
              <resource :value="villageState.incomingResources.crop" :hide-zero="true"></resource>
            </td>
            <td></td>
            <td></td>
          </tr>
          <tr class="normal-line">
            <td></td>
            <td class="right" colspan="6">
              <a
                class="village-quick-link"
                v-for="s in shared.villageStates"
                v-if="s.id !== villageState.id"
                :href="marketPath(villageState.village, s.village)"
                :title="'Отправить ресурсы из ' + villageState.village.name + ' в ' + s.village.name"
                >->{{ s.village.name }}</a
              >
              <a class="village-quick-link" :href="quartersPath(villageState.village)">Казармы</a>
              <a class="village-quick-link" :href="horseStablePath(villageState.village)">Конюшни</a>
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
import { HORSE_STABLE_ID, MARKET_ID, QUARTERS_ID, WAREHOUSE_ID } from '../Core/Buildings';

export default {
  components: {
    resource: ResourceBalance,
    filling: VillageResource,
  },
  data() {
    return {
      shared: this.$root.$data,
      activeVillageState: this.$root.$data.activeVillageState,
    };
  },
  methods: {
    path(name, args) {
      return path(name, args);
    },
    marketPath(fromVillage, toVillage) {
      return path('/build.php', {
        newdid: fromVillage.id,
        gid: MARKET_ID,
        t: 5,
        x: toVillage.crd.x,
        y: toVillage.crd.y,
      });
    },
    warehousePath(village) {
      return path('/build.php', { newdid: village.id, gid: WAREHOUSE_ID });
    },
    quartersPath(village) {
      return path('/build.php', { newdid: village.id, gid: QUARTERS_ID });
    },
    horseStablePath(village) {
      return path('/build.php', { newdid: village.id, gid: HORSE_STABLE_ID });
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

.performance-line td,
.required-line td,
.commitments-line td,
.incoming-line td {
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
