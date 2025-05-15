<template>
  <div class="timepicker-input">
    <label :for="itemKey">{{ label }}</label>
    <input
      :id="itemKey"
      type="time"
      class="form-control"
      :value="value"
      :placeholder="placeholder"
      step="1" 
      @input="$emit('update:value', $event.target.value)"
    />
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
export default {
  props: {
    itemKey: String,
    value: String,
    error: String,
    label: String,
    placeholder: String,
  },
};
</script>

<style scoped>
.timepicker-input {
  display: flex;
  flex-direction: column;
}

.error-message {
  color: red;
  font-size: 0.8rem;
}
</style>
