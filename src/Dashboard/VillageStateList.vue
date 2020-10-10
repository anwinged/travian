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
              [
              <a href="#" v-on:click.prevent="openEditor(villageState.id)">ред</a>,
              <a href="#" v-on:click.prevent="toggleTaskList(villageState.id)">здч</a>
              ]:
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.lumber"
                :warning="villageState.warehouse.optimumFullness.lumber"
                :critical="villageState.warehouse.criticalFullness.lumber"
                :full="villageState.warehouse.capacity.lumber"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.clay"
                :warning="villageState.warehouse.optimumFullness.clay"
                :critical="villageState.warehouse.criticalFullness.clay"
                :full="villageState.warehouse.capacity.clay"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.iron"
                :warning="villageState.warehouse.optimumFullness.iron"
                :critical="villageState.warehouse.criticalFullness.iron"
                :full="villageState.warehouse.capacity.iron"
              ></filling>
            </td>
            <td class="right">
              <filling
                :value="villageState.resources.crop"
                :warning="villageState.warehouse.optimumFullness.crop"
                :critical="villageState.warehouse.criticalFullness.crop"
                :full="villageState.warehouse.capacity.crop"
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

          <status-line class="second-line" :village-state="villageState" />

          <tr class="task-list-line" v-if="isTaskListVisible(villageState.id)">
            <td class="right" colspan="7">
              <village-task-list :village-id="villageState.id" :tasks="villageState.tasks" />
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
import { path } from '../Helpers/Path';
import { Actions } from './Store';
import { translateProductionQueue } from '../Core/ProductionQueue';
import VillageStateResourceLine from './VillageStateResourceLine';
import VillageStateStatusLine from './VillageStateStatusLine';
import VillageTaskList from './VillageTaskList';

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
    VillageTaskList,
    'resource': ResourceBalance,
    'filling': VillageResource,
    'resource-line': VillageStateResourceLine,
    'status-line': VillageStateStatusLine,
  },
  data() {
    return {
      shared: this.$root.$data,
      taskListView: {},
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
      const toZero = villageState.warehouse.timeToZero;
      const toFull = villageState.warehouse.timeToFull;
      return this.renderGatheringTime(toFull.never ? toZero : toFull);
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
    toggleTaskList(villageId) {
      this.taskListView[villageId] = !this.taskListView[villageId];
    },
    isTaskListVisible(villageId) {
      return !!this.taskListView[villageId];
    },
  },
};
</script>

<style scoped lang="scss">
@import 'style';
.village-table {
  width: 100%;
  max-width: 100%;
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

.task-list-line td {
  padding: 0;
  max-width: $panel-work-area;
  overflow: hidden;
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
