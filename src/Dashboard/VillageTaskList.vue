<template>
  <table class="task-list">
    <tr v-for="task in tasks">
      <td class="col-name" v-text="taskLabel(task)" :title="task.name + ', ' + task.id"></td>
      <td class="col-actions">
        <a href="#" class="action" @click.prevent="makeFirstTask(task.id)" title="Сделать первой"
          >fst</a
        >
        <a href="#" class="action" @click.prevent="upTask(task.id)" title="Поднять задачу">up</a>
        <a href="#" class="action" @click.prevent="downTask(task.id)" title="Опустить задачу">dn</a>
        <a href="#" class="action" @click.prevent="removeTask(task.id)" title="Удалить задачу">x</a>
      </td>
      <td class="col-args">
        <span
          class="args-text"
          v-text="JSON.stringify(task.args)"
          :title="JSON.stringify(task.args)"
        >
        </span>
      </td>
    </tr>
  </table>
</template>

<script>
import { Actions } from './Store';

export default {
  props: ['villageId', 'tasks'],
  computed: {},
  methods: {
    taskLabel(task) {
      let taskStatus = '';
      if (!task.isEnoughWarehouseCapacity) {
        taskStatus += 'w!';
      }
      if (!task.isEnoughGranaryCapacity) {
        taskStatus += 'g!';
      }
      if (taskStatus) {
        taskStatus = '(' + taskStatus + ') ';
      }
      return taskStatus + task.name;
    },
    makeFirstTask(taskId) {
      this.$store.dispatch(Actions.MakeFirstVillageTask, { villageId: this.villageId, taskId });
    },
    upTask(taskId) {
      this.$store.dispatch(Actions.UpVillageTask, { villageId: this.villageId, taskId });
    },
    downTask(taskId) {
      this.$store.dispatch(Actions.DownVillageTask, { villageId: this.villageId, taskId });
    },
    removeTask(taskId) {
      this.$store.dispatch(Actions.RemoveVillageTask, { villageId: this.villageId, taskId });
    },
  },
};
</script>

<style scoped lang="scss">
@import 'style';
.task-list {
  @extend %table;
}
.col-name {
  width: 20%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.col-actions {
  white-space: nowrap;
  max-width: 20%;
}
.col-args {
  width: 60%;
}
.args-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.action {
  display: inline-block;
}
.action + .action {
  margin-left: 0.3em;
}
</style>
