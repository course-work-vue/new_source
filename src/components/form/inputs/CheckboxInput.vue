<template>
  <labeled-input :label="label" :item-key="itemKey">
    <Checkbox v-model="model" :binary="binary"></Checkbox>
  </labeled-input>
  <input-error :error="error"></input-error>
</template>

<script>
import InputError from "@/components/form/inputs/templates/InputError.vue";
import { useModel } from "@/components/form/inputs/use/useModel";
import LabeledInput from "@/components/form/inputs/templates/LabeledInput.vue";

export default {
  name: "CheckboxEdit",
  components: { LabeledInput, InputError },
  props: {
    itemKey: {
      type: String,
    },
    value: {},
    label: {
      type: String,
    },
    error: {
      type: String,
    },
    binary: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const { model } = useModel(props, emit);

    return { model };
  },
};
</script>
