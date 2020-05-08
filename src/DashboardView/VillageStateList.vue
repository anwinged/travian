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
          <th class="right">Время</th>
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
            <td class="right" v-text="storageTime(villageState)"></td>
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
          </tr>
          <tr class="required-line">
            <td class="right">След. задача:</td>
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
            <td class="right" v-text="renderTimeInSeconds(villageState.buildRemainingSeconds)"></td>
          </tr>
          <tr class="required-line">
            <td class="right">Баланс задачи:</td>
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
            <td class="right" v-text="renderGatheringTime(villageState.required.time)"></td>
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
            <td class="right" v-text="renderGatheringTime(villageState.totalRequired.time)"></td>
          </tr>
          <tr class="commitments-line" v-if="!villageState.commitments.empty()">
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
          </tr>
          <tr class="incoming-line" v-if="!villageState.incomingResources.empty()">
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
          </tr>
          <tr class="normal-line">
            <td></td>
            <td class="right" colspan="5">
              <a
                v-for="s in shared.villageStates"
                v-if="s.id !== villageState.id"
                class="village-quick-link"
                :class="{ active: villageState.shipment.includes(s.id) }"
                :href="marketPath(villageState.village, s.village)"
                :title="
                  'Отправить ресурсы из ' +
                    villageState.village.name +
                    ' в ' +
                    s.village.name +
                    '(shift+click - настроить отправку)'
                "
                v-on:click.prevent.shift.exact="setupResourceTransfer(villageState, s)"
                v-on:click.prevent.exact="goToMarket(villageState.village, s.village)"
                >$->{{ s.village.name }}</a
              >
              <a class="village-quick-link" :href="quartersPath(villageState.village)">Казармы</a>
              <a class="village-quick-link" :href="horseStablePath(villageState.village)">Конюшни</a>
              <a class="village-quick-link" :href="collectionPointPath(villageState.village)">Войска</a>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </section>
</template>

<script>
import ResourceBalance from './ResourceBalance';
import VillageResource from './VillageResource';
import { COLLECTION_POINT_ID, HORSE_STABLE_ID, MARKET_ID, QUARTERS_ID } from '../Core/Buildings';
import { path } from '../Helpers/Path';

function secondsToTime(value) {
  if (value === 0) {
    return '';
  }
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = Math.floor(value % 60);
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

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
    storageTime(villageState) {
      const toZero = villageState.storageBalance.timeToZero;
      const toFull = villageState.storageBalance.timeToFull;
      return this.renderGatheringTime(toFull.never ? toZero : toFull);
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
    collectionPointPath(village) {
      return path('/build.php', { newdid: village.id, gid: COLLECTION_POINT_ID, tt: 1 });
    },
    quartersPath(village) {
      return path('/build.php', { newdid: village.id, gid: QUARTERS_ID });
    },
    horseStablePath(village) {
      return path('/build.php', { newdid: village.id, gid: HORSE_STABLE_ID });
    },
    renderTimeInSeconds(value) {
      return secondsToTime(value);
    },
    /**
     * @param {GatheringTime} value
     * @returns {string}
     */
    renderGatheringTime(value) {
      if (value.never) {
        return 'never';
      }
      return secondsToTime(value.seconds);
    },
    goToMarket(fromVillage, toVillage) {
      window.location.assign(this.marketPath(fromVillage, toVillage));
    },
    setupResourceTransfer(villageState, toVillageState) {
      villageState.shipment.includes(toVillageState.id)
        ? this.dropResourceTransferTasks(villageState.id, toVillageState.id)
        : this.scheduleResourceTransferTasks(villageState.id, toVillageState.id);
    },
    scheduleResourceTransferTasks(fromVillageId, toVillageId) {
      this.shared.scheduleResourceTransferTasks(fromVillageId, toVillageId);
    },
    dropResourceTransferTasks(fromVillageId, toVillageId) {
      this.shared.dropResourceTransferTasks(fromVillageId, toVillageId);
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

.village-quick-link.active {
  color: midnightblue;
}

.village-quick-link + .village-quick-link {
  margin-left: 0.4em;
}
</style>
