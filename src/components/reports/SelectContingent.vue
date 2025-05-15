<template>
  <div class="select-contingent">
    <label :for="id" class="form-label me-2">{{ label }}:</label>
    <select
      :id="id"
      class="form-select"
      v-model="localValue"
      @change="emitChange"
    >
      <option disabled value="">– Выберите –</option>
      <option
        v-for="opt in options"
        :key="opt.value.type"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SelectContingent',
  props: {
    modelValue: {                   // v-model
      type: Object,
      default: () => ({ type: '', id: null })
    },
    options: {                      // [{ label, value: { type } }, …]
      type: Array,
      required: true
    },
    label: {                        // подпись
      type: String,
      default: 'Контингент'
    }
  },
  data() {
    return {
      localValue: this.modelValue
    };
  },
  computed: {
    id() {
      return `select-contingent-${this._.uid}`;
    }
  },
  methods: {
    emitChange() {
      this.$emit('update:modelValue', this.localValue);
    }
  }
};
</script>

<style scoped>
.select-contingent {
  display: flex;
  align-items: center;
}
</style>
