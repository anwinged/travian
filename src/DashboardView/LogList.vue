<template>
  <section class="log-list">
    <p class="summary"><strong>Logs</strong>, <a href="#" v-on:click.prevent="close">close</a></p>
    <table class="log-table">
      <tr v-for="record in logs" :class="rowClasses(record)">
        <td v-text="record.level"></td>
        <td v-text="formatDate(record.ts)"></td>
        <td v-text="record.message"></td>
      </tr>
    </table>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';
import * as dateFormat from 'dateformat';
import { Mutations } from './Store';

export default {
  computed: {
    ...mapGetters({
      logs: 'reverseLogs',
    }),
  },
  methods: {
    rowClasses(record) {
      return {
        error: record.level === 'error' || undefined,
        warning: record.level === 'warn' || undefined,
      };
    },
    formatDate(ts) {
      const d = new Date(ts * 1000);
      return dateFormat(d, 'HH:MM:ss');
    },
    close() {
      this.$store.commit(Mutations.hideLogs);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'style';
.summary {
  @include with-padding;
}
.log-list {
  background-color: white;
}
.log-table {
  @extend %table;

  .error {
    color: $error-color;
  }

  .warning {
    color: $waring-color;
  }
}
</style>
