<template>
  <labeled-input :label="label" :item-key="itemKey">
    <!-- https://primevue.org/dropdown/-->
    <Dropdown
      v-model="model"
      :class="inputClass"
      :options="options"
      :option-value="optionValue"
      :option-label="optionLabel"
      :filter="filter"
      class="w-full"
    >
    </Dropdown>
  </labeled-input>
  <input-error :error="error"></input-error>
</template>

<script>
import { useInputClass } from "@/components/form/inputs/use/useInputClass";
import { useModel } from "@/components/form/inputs/use/useModel";
import InputError from "@/components/form/inputs/templates/InputError.vue";
import LabeledInput from "@/components/form/inputs/templates/LabeledInput.vue";

export default {
  name: "ComboboxInput",
  components: {
    InputError,
    LabeledInput,
  },
  props: {
    itemKey: {
      type: String,
    },
    label: {
      type: String,
    },
    value: {},
    error: {
      type: String,
    },
    options: {
      type: Array,
    },
    optionLabel: {
      type: String,
      default: "label",
    },
    optionValue: {
      type: String,
      default: "value",
    },
    filter: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const { inputClass } = useInputClass(props);
    const { model } = useModel(props, emit);

    return { inputClass, model };
  },
};
</script>
