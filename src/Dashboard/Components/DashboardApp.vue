<template>
  <main id="dashboard">
    <div id="dashboard-inner">
      <hdr></hdr>
      <task-list></task-list>
      <hr class="separator" />
      <quick-actions></quick-actions>
    </div>
  </main>
</template>

<script>
import Header from './Header';
import TaskList from './TaskList';
import QuickActions from './QuickActions';
export default {
  components: {
    hdr: Header,
    'task-list': TaskList,
    'quick-actions': QuickActions,
  },
  data() {
    return {};
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
  margin: 4px;
  padding-bottom: 10px;
}
.separator {
  margin: 10px auto;
}
</style>
