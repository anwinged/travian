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
import { Mutations } from './Store';
import { formatDate } from '../Helpers/Format';

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
      return formatDate(ts);
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
