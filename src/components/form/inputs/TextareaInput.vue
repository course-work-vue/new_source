<template>
    <div class="textarea-input-wrapper mb-3">
      <label v-if="label" :for="itemKey" class="form-label">{{ label }}</label>
      <textarea
        :id="itemKey"
        :value="value"
        @input="$emit('update:value', $event.target.value)"
        :placeholder="placeholder"
        :rows="rows"
        :class="['form-control', className, { 'is-invalid': !!error }]"
        v-bind="$attrs"
      ></textarea>
      <div v-if="error" class="invalid-feedback">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script setup>

  import { defineProps, defineEmits } from 'vue';
  
  defineProps({
    itemKey: { type: String, required: true },
    value: { type: String, default: '' },
    error: { type: String, default: null },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    rows: { type: Number, default: 3 },
    className: { type: String, default: '' },
  });
  
  defineEmits(['update:value']);
  </script>
  
  <style scoped>
  .textarea-input-wrapper {
    width: 100%;
  }

  </style>