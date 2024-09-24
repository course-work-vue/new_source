<template>
  <labeled-input :label="label" :item-key="itemKey">
    <input-with-icon :icon="icon" :icon-right="iconRight">
      <InputText
        :id="itemKey"
        v-model.lazy="model"
        :placeholder="placeholder"
        :class="inputClass"
      ></InputText>
    </input-with-icon>
  </labeled-input>
  <input-error :error="error"></input-error>
</template>

<script>
import { useInputClass } from "@/components/form/inputs/use/useInputClass";
import { useModel } from "@/components/form/inputs/use/useModel";
import InputError from "@/components/form/inputs/templates/InputError.vue";
import LabeledInput from "@/components/form/inputs/templates/LabeledInput.vue";
import InputWithIcon from "@/components/form/inputs/templates/InputWithIcon.vue";

export default {
  name: "TextEdit",
  components: { InputWithIcon, LabeledInput, InputError },
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
    icon: {
      type: String,
    },
    iconRight: {
      type: Boolean,
    },
    value: {
      type: String,
    },
    placeholder: {
      type: String,
    },
    error: {
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
