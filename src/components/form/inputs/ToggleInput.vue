<template>
  <labeled-input :label="label" :item-key="itemKey">
    <!-- https://primevue.org/togglebutton/-->
    <ToggleButton
      v-model="model"
      :class="inputClass"
      :on-label="onLabel"
      :off-label="offLabel"
      :on-icon="onIcon"
      :off-icon="offIcon"
      class="flex"
    ></ToggleButton>
  </labeled-input>
  <input-error :error="error"></input-error>
</template>

<script>
import { useInputClass } from "@/components/form/inputs/use/useInputClass";
import { useModel } from "@/components/form/inputs/use/useModel";
import LabeledInput from "@/components/form/inputs/templates/LabeledInput.vue";
import InputError from "@/components/form/inputs/templates/InputError.vue";

export default {
  name: "Toggle",
  components: { LabeledInput, InputError },
  props: {
    value: {},
    error: {
      type: String,
    },
    label: {
      type: String,
    },
    onLabel: {
      type: String,
      default: "Yes",
    },
    offLabel: {
      type: String,
      default: "No",
    },
    onIcon: {
      type: String,
    },
    offIcon: {
      type: String,
    },
    itemKey: {
      type: String,
    },
  },
  setup(props, { emit }) {
    const { inputClass } = useInputClass(props);
    const { model } = useModel(props, emit);

    return { inputClass, model };
  },
};
</script>
