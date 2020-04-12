<template>
  <section class="task-list">
    <p class="summary">Task count: {{ shared.taskList.length }}</p>
    <div class="container">
      <table class="task-table">
        <tr v-for="task in shared.taskList" class="task-item" :class="{ 'this-village': isThisVillageTask(task) }">
          <td :title="formatDate(task.ts)">{{ formatDate(task.ts) }}</td>
          <td :title="task.id">{{ task.id }}</td>
          <td>
            <a href="#" title="Remove task" class="remove-action" v-on:click.prevent="onRemove(task.id)">&times;</a>
          </td>
          <td :title="task.name">{{ task.name }}</td>
          <td :title="JSON.stringify(task.args)">{{ JSON.stringify(task.args) }}</td>
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
    };
  },
  computed: {},
  methods: {
    formatDate(ts) {
      const d = new Date(ts * 1000);
      return dateFormat(d, 'HH:MM:ss');
    },
    isThisVillageTask(task) {
      const taskVillageId = (task.args || {}).villageId;
      const currentVillageId = (this.shared.village || {}).id;
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
  margin: 8px 8px auto;
}
.summary {
  margin: 10px auto 0;
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
  padding: 2px 4px;
  max-width: 25%;
}
.this-village {
  color: blue;
}
.remove-action {
  font-weight: bold;
  color: red;
}
</style>
