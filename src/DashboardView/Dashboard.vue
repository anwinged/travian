<template>
  <main id="dashboard">
    <section id="dashboard-primary">
      <hdr></hdr>
      <village-state-list />
      <hr class="separator" />
      <quick-actions />
      <hr class="separator" />
      <task-list />
    </section>
    <section id="dashboard-secondary">
      <log-list v-if="isLogsVisible" />
    </section>
  </main>
</template>

<script>
import Header from './Header';
import TaskList from './TaskList';
import QuickActions from './QuickActions';
import VillageStateList from './VillageStateList';
import LogList from './LogList';
import { mapState } from 'vuex';
export default {
  components: {
    'hdr': Header,
    'task-list': TaskList,
    'quick-actions': QuickActions,
    'village-state-list': VillageStateList,
    'log-list': LogList,
  },
  data() {
    return {
      shared: this.$root.$data,
    };
  },
  computed: mapState({
    isLogsVisible: state => state.views.logs,
  }),
};
</script>

<style scoped>
#dashboard {
  position: absolute;
  display: flex;
  left: 0;
  top: 0;
  z-index: 9999;
  box-sizing: border-box;
}
#dashboard * {
  box-sizing: border-box;
}
#dashboard-primary {
  /*height: 100vh;*/
  /*overflow-y: scroll;*/
  background-color: white;
  width: 500px;
  padding: 5px;
}
#dashboard-secondary {
  background-color: transparent;
  max-width: 800px;
  width: 800px;
  margin-top: 120px;
  padding-left: 10px;
}
#dashboard-secondary:empty {
  display: none;
}
.separator {
  margin: 10px auto;
}
</style>
