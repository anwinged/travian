<template>
  <section class="task-list">
    <p class="summary">
      Task count: {{ shared.taskList.length }}
      <template v-if="actionCount">, actions left {{ actionCount }}</template>
    </p>
    <div class="container">
      <table class="task-table">
        <tr v-for="task in shared.taskList" class="task-item" :class="{ 'this-village': isThisVillageTask(task) }">
          <td class="time-column" :title="formatDate(task.ts)">{{ formatDate(task.ts) }}</td>
          <td class="id-column" :title="task.id">{{ task.id }}</td>
          <td class="actions-column">
            <a href="#" title="Remove task" class="remove-action" v-on:click.prevent="onRemove(task.id)">&times;</a>
          </td>
          <td class="name-column" :title="task.name">{{ task.name }}</td>
          <td class="args-column" :title="JSON.stringify(task.args)">{{ JSON.stringify(task.args) }}</td>
        </tr>
      </table>
    </div>
  </section>
</template>

<script>
import * as dateFormat from 'dateformat';

export default {
  data() {
    return {
      shared: this.$root.$data,
      activeVillage: this.$root.$data.activeVillage,
    };
  },
  computed: {
    actionCount() {
      return this.shared.actionList.length;
    },
  },
  methods: {
    formatDate(ts) {
      const d = new Date(ts * 1000);
      return dateFormat(d, 'HH:MM:ss');
    },
    isThisVillageTask(task) {
      const taskVillageId = (task.args || {}).villageId;
      const currentVillageId = this.activeVillage.id;
      return taskVillageId !== undefined && taskVillageId === currentVillageId;
    },
    onRemove(taskId) {
      console.log('ON REMOVE TASK', taskId);
      this.shared.removeTask(taskId);
    },
  },
};
</script>

<style scoped>
.task-list {
  margin-top: 8px;
  margin-bottom: 8px;
}
.summary {
  margin-top: 10px;
  margin-bottom: 0;
}
.container {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 300px;
}
.task-table {
  width: 100%;
  border-collapse: collapse;
  margin: 6px auto 0;
}
.task-item > td {
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  padding: 2px 4px;
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
