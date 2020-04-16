<template>
  <main id="dashboard">
    <div id="dashboard-inner">
      <hdr></hdr>
      <village-state-list></village-state-list>
      <hr class="separator" />
      <quick-actions></quick-actions>
      <hr class="separator" />
      <task-list></task-list>
    </div>
  </main>
</template>

<script>
import Header from './Header';
import TaskList from './TaskList';
import QuickActions from './QuickActions';
import VillageStateList from './VillageStateList';
export default {
  components: {
    hdr: Header,
    'task-list': TaskList,
    'quick-actions': QuickActions,
    'village-state-list': VillageStateList,
  },
  data() {
    return {
      shared: this.$root.$data,
    };
  },
};
</script>

<style scoped>
#dashboard {
  position: absolute;
  display: block;
  left: 0;
  top: 0;
  height: 100%;
  width: 500px;
  z-index: 9999;
  /*overflow: hidden;*/
}
#dashboard * {
  box-sizing: border-box;
}
#dashboard-inner {
  background-color: white;
  padding: 5px;
}
.separator {
  margin: 10px auto;
}
</style>
