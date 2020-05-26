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
          <th class="right" title="Время до окончания добычи необходимых ресурсов">Рес.</th>
          <th class="right" title="Время до окончания выполнения текущей задачи">Оч.</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="villageState in shared.villageStates">
          <tr class="normal-line top-line">
            <td
              class="right"
              :class="{ active: villageState.village.active }"
              :title="villageHint(villageState)"
            >
              {{ villageState.village.name }}
              [<a href="#" v-on:click.prevent="openEditor(villageState.id)">ред</a>]:
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.lumber"
                :max="villageState.storage.capacity.lumber"
                :speed="villageState.performance.lumber"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.clay"
                :max="villageState.storage.capacity.clay"
                :speed="villageState.performance.clay"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.iron"
                :max="villageState.storage.capacity.iron"
                :speed="villageState.performance.iron"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.crop"
                :max="villageState.storage.capacity.crop"
                :speed="villageState.performance.crop"
              ></filling>
            </td>
            <td class="right" v-text="storageTime(villageState)"></td>
            <td></td>
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
            <td></td>
            <td></td>
          </tr>

          <resource-line
            v-for="queueState of villageState.queues"
            v-bind:key="villageState.id + queueState.queue"
            v-if="queueState.isActive"
            :title="queueTitle(queueState.queue) + ' (' + queueState.taskCount + '):'"
            :hint="'Задач в очереди: ' + queueState.taskCount"
            :resources="queueState.firstTask.balance"
            :time1="renderGatheringTime(queueState.firstTask.time)"
            :time2="renderTimeInSeconds(queueState.currentTaskFinishSeconds)"
          />

          <resource-line
            :title="'Баланс фронтира:'"
            :hint="'Баланс первых задач во всех производственных очередях'"
            :resources="villageState.frontierRequired.balance"
            :time1="renderGatheringTime(villageState.frontierRequired.time)"
          />

          <resource-line
            :title="'Баланс очереди:'"
            :hint="'Баланс всех задач деревни в очереди'"
            :resources="villageState.totalRequired.balance"
            :time1="renderGatheringTime(villageState.totalRequired.time)"
          />

          <resource-line
            :title="'Торговцы:'"
            :resources="villageState.incomingResources"
            :hide-zero="true"
            v-if="!villageState.incomingResources.empty()"
          />

          <tr class="normal-line">
            <td class="right" colspan="7">
              <a
                v-for="s in shared.villageStates"
                v-if="s.id !== villageState.id"
                class="village-quick-link"
                :href="marketPath(villageState.village, s.village)"
                :title="
                  'Отправить ресурсы из ' + villageState.village.name + ' в ' + s.village.name
                "
                >$->{{ s.village.name }}</a
              >
              <a class="village-quick-link" :href="quartersPath(villageState.village)">Казармы</a>
              <a class="village-quick-link" :href="horseStablePath(villageState.village)"
                >Конюшни</a
              >
              <a class="village-quick-link" :href="collectionPointPath(villageState.village)"
                >Войска</a
              >
            </td>
          </tr>

          <tr class="normal-line">
            <td class="right" colspan="7" v-text="villageStatus(villageState)"></td>
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
import { Actions } from './Store';
import { translateProductionQueue } from '../Core/ProductionQueue';
import VillageStateResourceLine from './VillageStateResourceLine';

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
    'resource': ResourceBalance,
    'filling': VillageResource,
    'resource-line': VillageStateResourceLine,
  },
  data() {
    return {
      shared: this.$root.$data,
    };
  },
  methods: {
    villageHint(villageState) {
      const id = villageState.id;
      const name = villageState.village.name;
      return `${name}, ${id}`;
    },
    villageStatus(villageState) {
      const timeout = villageState.settings.sendResourcesTimeout;
      const threshold = villageState.settings.sendResourcesThreshold;
      const multiplier = villageState.settings.sendResourcesMultiplier;
      return `отправка ${timeout} мин, порог ${threshold}, множ. ${multiplier}`;
    },
    path(name, args) {
      return path(name, args);
    },
    storageTime(villageState) {
      const toZero = villageState.storage.timeToZero;
      const toFull = villageState.storage.timeToFull;
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
    openEditor(villageId) {
      this.$store.dispatch(Actions.OpenVillageEditor, { villageId });
    },
    queueTitle(queue) {
      return translateProductionQueue(queue);
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
