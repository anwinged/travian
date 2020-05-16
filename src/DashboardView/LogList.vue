<template>
  <section class="log-list">
    <p><strong>Logs</strong>, <a href="#" v-on:click.prevent="close">close</a></p>
    <table class="log-table">
      <tr v-for="record in logs" class="log-record">
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

<style scoped>
.log-list {
  background-color: white;
}
.log-table {
  width: 100%;
  border-collapse: collapse;
  margin: 6px auto 0;
}
.log-record > td {
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  padding: 2px 4px;
}
</style>
