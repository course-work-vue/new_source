<template>
  <div class="multiselect-input-wrapper">
    <labeled-input :label="label" :item-key="itemKey" :is-invalid="!!error">
      <MultiSelect
        :id="itemKey"
        :modelValue="value"
        @update:modelValue="handleUpdate"
        :options="options"
        :optionLabel="optionLabel"
        :optionValue="optionValue"
        :placeholder="placeholder" 
        :filter="filter"
        panelClass="custom-multiselect-panel"
        :invalid="!!error"
        :class="['w-100 custom-multiselect', className, { 'p-invalid': !!error }]"
        v-bind="$attrs"
        :virtualScrollerOptions="{ itemSize: 38 }"
      >
        <template #value="slotProps">
          <template v-if="!slotProps.value || slotProps.value.length === 0">
            <span class="p-multiselect-label p-placeholder">
              {{ slotProps.placeholder }}
            </span>
          </template>
          <template v-else>
            <span class="p-multiselect-label">
              {{ selectedItemsTextTemplate.replace('{0}', slotProps.value.length) }}
            </span>
          </template>
        </template>
      </MultiSelect>
    </labeled-input>
    <input-error :error="error"></input-error>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, watch, onMounted} from 'vue';
import MultiSelect from 'primevue/multiselect';
import LabeledInput from "@/components/form/inputs/templates/LabeledInput.vue";
import InputError from "@/components/form/inputs/templates/InputError.vue";

const props = defineProps({
  itemKey: { type: String, required: true },
  value: { type: Array, default: () => [] },
  error: { type: String, default: null },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Выберите программы' }, // Плейсхолдер по умолчанию
  options: { type: Array, required: true },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: 'value' },
  filter: { type: Boolean, default: true },
  className: { type: String, default: '' },
  selectedItemsTextTemplate: { type: String, default: '{0} выбрано' }
});

const emit = defineEmits(['update:value']);

onMounted(() => {
});

watch(() => props.value, (newValue, oldValue) => {
  console.log(`[MultiSelectInput ${props.itemKey}] VALUE CHANGED. New:`, JSON.parse(JSON.stringify(newValue)), "Old:", JSON.parse(JSON.stringify(oldValue)));
  if (!Array.isArray(newValue)) {
    console.error(`[MultiSelectInput ${props.itemKey}] ERROR: New value is not an array!`, newValue);
  }
}, { deep: true });

watch(() => props.placeholder, (newPlaceholder) => {
  console.log(`[MultiSelectInput ${props.itemKey}] PLACEHOLDER PROP CHANGED. New:`, newPlaceholder);
});

const handleUpdate = (newValue) => {
  emit('update:value', newValue || []);
};

const actualPlaceholder = computed(() => {
  console.log(`[MultiSelectInput ${props.itemKey}] COMPUTED actualPlaceholder. props.placeholder:`, props.placeholder, `props.value.length:`, props.value.length);
  if (props.value && props.value.length > 0) {
    return props.selectedItemsTextTemplate.replace('{0}', props.value.length);
  }
  return props.placeholder; 
});

</script>

<style scoped>
.multiselect-input-wrapper {
  width: 100%;
  margin-bottom: 1rem;
}

:deep(.custom-multiselect.p-multiselect) {
  font-size: 1rem !important;
  line-height: 1.5;
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  padding-left: 0.75rem !important;
  padding-right: 0.75rem !important;
  min-height: calc(2.5rem + 2px); 
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

:deep(.custom-multiselect .p-multiselect-label) {
  padding: 0 !important;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.custom-multiselect .p-multiselect-label.p-placeholder) {
   color: var(--p-text-color-secondary, #6c757d);
}


/* Панель с опциями */
:deep(.custom-multiselect-panel .p-multiselect-items .p-multiselect-item) {
   padding-top: 0.5rem;
   padding-bottom: 0.5rem;
}

:deep(.custom-multiselect-panel .p-multiselect-items .p-multiselect-item .p-checkbox) {
  margin-right: 0.5rem;
}
</style>