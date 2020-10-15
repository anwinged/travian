<template>
  <table class="hero">
    <tr>
      <td>Герой</td>
      <td>Здоровье</td>
      <td v-text="shared.heroAttr.health"></td>
    </tr>
  </table>
</template>

<script>
export default {
  data() {
    return {
      shared: this.$root.$data,
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'style';
.hero {
  @extend %table;
}
</style>
