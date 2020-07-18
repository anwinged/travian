<template>
  <section class="task-list">
    <p class="summary">
      Task count: {{ shared.taskList.length
      }}<!--
      --><template v-if="actionCount">, actions left {{ actionCount }}</template
      ><!--
      --><template v-if="currentAction">, {{ currentAction.name }}</template>
    </p>
    <div class="container">
      <table class="task-table">
        <tr
          v-for="task in shared.taskList"
          class="task-item"
          :class="{ 'this-village': isThisVillageTask(task) }"
        >
          <td
            class="time-column"
            :title="formatDate(task.ts) + ', ' + task.id"
            v-text="formatDate(task.ts)"
          ></td>
          <td class="actions-column">
            <a
              href="#"
              title="Remove task"
              class="remove-action"
              v-on:click.prevent="onRemove(task.id)"
              >&times;</a
            >
          </td>
          <td class="village-column" v-text="task.args.villageId || ''"></td>
          <td class="name-column" :title="task.name" v-text="task.name"></td>
          <td
            class="args-column"
            :title="JSON.stringify(task.args)"
            v-text="JSON.stringify(task.args)"
          ></td>
        </tr>
      </table>
    </div>
  </section>
</template>

<script>
import { formatDate } from '../Helpers/Format';

export default {
  data() {
    return {
      shared: this.$root.$data,
      activeVillageState: this.$root.$data.activeVillageState,
    };
  },
  computed: {
    actionCount() {
      return this.shared.actionList.length;
    },
    currentAction() {
      return this.shared.actionList.find(() => true);
    },
  },
  methods: {
    formatDate(ts) {
      return formatDate(ts);
    },
    isThisVillageTask(task) {
      const taskVillageId = (task.args || {}).villageId;
      const currentVillageId = this.activeVillageState.id;
      return taskVillageId !== undefined && taskVillageId === currentVillageId;
    },
    onRemove(taskId) {
      console.log('ON REMOVE TASK', taskId);
      this.shared.removeTask(taskId);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'style';
.task-list {
  margin-top: 8px;
  margin-bottom: 8px;
}
.summary {
  margin-top: 10px;
  margin-bottom: 0;
}
.container {
  overflow-x: hidden;
}
.task-table {
  @extend %table;
}
.this-village {
  color: blue;
}
.remove-action {
  font-weight: bold;
  color: red;
}
.time-column,
.actions-column {
  max-width: 25%;
}
.id-column {
  max-width: 80px;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
.name-column {
  max-width: 80px;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
.args-column {
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
</style>
