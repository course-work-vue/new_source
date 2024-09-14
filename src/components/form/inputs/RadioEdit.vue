<template>
  <labeled-input :label="label" :item-key="itemKey">
    <div class="flex flex-row">
      <div
        v-for="option in options"
        :key="option.value"
        class="flex align-items-center mr-2"
      >
        <RadioButton
          v-model="model"
          :input-id="itemKey + '_' + option.value"
          :name="itemKey"
          :value="option.value"
          :class="inputClass"
        ></RadioButton>
        <label :for="itemKey + '_' + option.value" class="ml-2">
          {{ option.label }}
        </label>
      </div>
    </div>
  </labeled-input>
  <input-error :error="error"></input-error>
</template>

<script>
import LabeledInput from "@/components/form/inputs/templates/LabeledInput.vue";
import InputError from "@/components/form/inputs/templates/InputError.vue";
import { useInputClass } from "@/components/form/inputs/use/useInputClass";
import { useModel } from "@/components/form/inputs/use/useModel";

export default {
  name: "RadioEdit",
  components: { LabeledInput, InputError },
  props: {
    itemKey: {
      type: String,
    },
    label: {
      type: String,
    },
    size: {
      default: "md",
      type: String,
    },
    value: {
      type: String,
    },
    error: {
      type: String,
    },
    options: {
      type: Array,
    },
  },
  setup(props, { emit }) {
    const { inputClass } = useInputClass(props);
    const { model } = useModel(props, emit);

    return { inputClass, model };
  },
};
</script>
