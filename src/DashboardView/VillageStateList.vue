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
                :warning="villageState.storageOptimumFullness.lumber"
                :critical="villageState.upperCriticalLevel.lumber"
                :full="villageState.storage.capacity.lumber"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.clay"
                :warning="villageState.storageOptimumFullness.clay"
                :critical="villageState.upperCriticalLevel.clay"
                :full="villageState.storage.capacity.clay"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.iron"
                :warning="villageState.storageOptimumFullness.iron"
                :critical="villageState.upperCriticalLevel.iron"
                :full="villageState.storage.capacity.iron"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.crop"
                :warning="villageState.storageOptimumFullness.crop"
                :critical="villageState.upperCriticalLevel.crop"
                :full="villageState.storage.capacity.crop"
              ></filling>
            </td>
            <td class="right" v-text="storageTime(villageState)"></td>
            <td></td>
          </tr>

          <resource-line :title="'Добыча:'" :resources="villageState.performance" :color="false" />

          <resource-line
            v-for="queueState of villageState.queues"
            v-bind:key="villageState.id + queueState.queue"
            v-if="queueState.isActive"
            :title="queueTitle(queueState.queue) + ' (' + queueState.taskCount + '):'"
            :hint="'Задач в очереди: ' + queueState.taskCount"
            :resources="queueState.firstTask.balance"
            :time1="renderGatheringTime(queueState.firstTask.time)"
            :time2="renderTimeInSeconds(queueState.currentTaskFinishSeconds)"
            :color="queueState.isWaiting"
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
            </td>
          </tr>

          <status-line class="second-line" :village-state="villageState" />
        </template>
      </tbody>
    </table>
  </section>
</template>

<script>
import ResourceBalance from './ResourceBalance';
import VillageResource from './VillageResource';
import { MARKET_ID } from '../Core/Buildings';
import { path } from '../Helpers/Path';
import { Actions } from './Store';
import { translateProductionQueue } from '../Core/ProductionQueue';
import VillageStateResourceLine from './VillageStateResourceLine';
import VillageStateStatusLine from './VillageStateStatusLine';

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
    'status-line': VillageStateStatusLine,
  },
  data() {
    return {
      shared: this.$root.$data,
      extendedView: {},
    };
  },
  methods: {
    villageHint(villageState) {
      const id = villageState.id;
      const name = villageState.village.name;
      return `${name}, ${id}`;
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

.second-line td {
  padding: 0 4px 4px;
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
