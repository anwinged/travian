<template>
  <main id="dashboard" v-on:keyup.76="toggleLogs">
    <section id="dashboard-primary">
      <hdr />
      <village-state-list />
      <hero-view />
      <hr class="separator" />
      <task-list />
    </section>
    <section id="dashboard-secondary" v-if="isSecondaryDashboardVisible">
      <log-list v-if="isLogsVisible" />
      <village-editor v-if="isVillageEditorVisible" />
    </section>
  </main>
</template>

<script>
import Header from './Header';
import TaskList from './TaskList';
import VillageStateList from './VillageStateList';
import LogList from './LogList';
import { mapState } from 'vuex';
import { Mutations } from './Store';
import VillageEditor from './VillageEditor';
import HeroView from './HeroView';
export default {
  components: {
    'village-editor': VillageEditor,
    'hdr': Header,
    'hero-view': HeroView,
    'task-list': TaskList,
    'village-state-list': VillageStateList,
    'log-list': LogList,
  },
  data() {
    return {
      shared: this.$root.$data,
    };
  },
  computed: {
    ...mapState({
      isLogsVisible: (state) => state.views.logs,
      isVillageEditorVisible: (state) => state.views.villageEditor,
    }),
    isSecondaryDashboardVisible() {
      return this.isLogsVisible || this.isVillageEditorVisible;
    },
  },
  methods: {
    toggleLogs() {
      this.$store.commit(Mutations.toggleLogs);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'style';
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
  background-color: white;
  width: $panel-size;
  padding: $panel-padding;
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
