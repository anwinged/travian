<template>
  <section class="village-editor">
    <p class="summary">
      Village Editor: {{ villageName }},
      <a href="#" v-on:click.prevent="close">close</a>
    </p>
    <form class="form" action="" v-on:submit.prevent="save">
      <div class="form-input">
        <label class="label" title="Порог отправки (сумма)">Порог отправки (сумма)</label>
        <input class="input" type="text" v-model="sendResourcesThreshold" />
      </div>
      <div class="form-input">
        <label class="label" title="Таймаут отправки (мин)">Таймаут отправки (мин)</label>
        <input class="input" type="text" v-model="sendResourcesTimeout" />
      </div>
      <div class="form-actions">
        <button class="btn">Сохранить</button>
      </div>
    </form>
  </section>
</template>

<script>
import { Actions, Mutations } from './Store';
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      villageName: state => state.villageSettings.villageName,
    }),
    sendResourcesThreshold: {
      get() {
        return this.$store.state.villageSettings.sendResourcesThreshold;
      },
      set(value) {
        this.$store.commit(Mutations.UpdateVillageSendResourceThreshold, value);
      },
    },
    sendResourcesTimeout: {
      get() {
        return this.$store.state.villageSettings.sendResourcesTimeout;
      },
      set(value) {
        this.$store.commit(Mutations.UpdateVillageSendResourceTimeout, value);
      },
    },
  },
  methods: {
    close() {
      this.$store.commit(Mutations.ToggleVillageEditor, false);
    },
    save() {
      this.$store.dispatch(Actions.SaveVillageSettings);
    },
  },
};
</script>

<style scoped lang="scss">
@import 'style';
.village-editor {
  background-color: white;
}
.summary {
  @include with-padding;
}
.form {
  padding-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
}
.form-input {
  margin-bottom: 5px;
}
.label {
  display: inline-block;
  width: 200px;
  text-align: right;
}
.input {
  margin-left: 5px;
}
.form-actions {
  margin-top: 10px;
}
.btn {
  border: 1px solid #555;
  padding: 2px 4px;
}
</style>
