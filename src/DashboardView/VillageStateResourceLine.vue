<template>
  <tr class="resource-line">
    <td class="title" v-text="title" :title="hint"></td>
    <td class="lumber">
      <resource :value="resources.lumber" :hide-zero="hideZero" :color="color" :sign="sign" />
    </td>
    <td class="clay">
      <resource :value="resources.clay" :hide-zero="hideZero" :color="color" :sign="sign" />
    </td>
    <td class="iron">
      <resource :value="resources.iron" :hide-zero="hideZero" :color="color" :sign="sign" />
    </td>
    <td class="crop">
      <resource :value="resources.crop" :hide-zero="hideZero" :color="color" :sign="sign" />
    </td>
    <td class="time1" v-text="time1"></td>
    <td class="time2" v-text="time2"></td>
  </tr>
</template>

<script>
import ResourceBalance from './ResourceBalance';

export default {
  components: {
    resource: ResourceBalance,
  },
  props: {
    title: {
      type: String,
    },
    hint: {
      type: String,
      default: '',
    },
    resources: {
      type: Object,
    },
    time1: {
      type: String,
      default: '',
    },
    time2: {
      type: String,
      default: '',
    },
    hideZero: {
      type: Boolean,
      default: false,
    },
    color: {
      type: Boolean,
      default: true,
    },
    sign: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style scoped lang="scss">
%right {
  text-align: right;
}
%small-cell {
  padding: 0 4px 4px;
  font-size: 90%;
}
.resource-line:hover {
  background-color: #b0e787;
}
.title {
  @extend %right;
  @extend %small-cell;
  white-space: nowrap;
}
.lumber {
  @extend %right;
  @extend %small-cell;
}
.clay {
  @extend %right;
  @extend %small-cell;
}
.iron {
  @extend %right;
  @extend %small-cell;
}
.crop {
  @extend %right;
  @extend %small-cell;
}
.time1 {
  @extend %right;
  @extend %small-cell;
}
.time2 {
  @extend %right;
  @extend %small-cell;
}
</style>
