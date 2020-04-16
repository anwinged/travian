<template>
  <section>
    <table class="village-table">
      <tr v-for="village in shared.villages" :key="village.id">
        <td>{{ village.id }} - {{ village.name }}</td>
        <td>Д: {{ resources(village.id).lumber }}</td>
        <td>Г: {{ resources(village.id).clay }}</td>
        <td>Ж: {{ resources(village.id).iron }}</td>
        <td>З: {{ resources(village.id).crop }}</td>
      </tr>
    </table>
  </section>
</template>

<script>
export default {
  data() {
    return {
      shared: this.$root.$data,
    };
  },
  methods: {
    resources(id) {
      return this.shared.getVillageResources(id);
    },
  },
};
</script>

<style scoped>
.village-table {
  width: 100%;
  border-collapse: collapse;
}

.village-table td {
  border-top: 1px solid #ddd;
  padding: 4px;
}
</style>
