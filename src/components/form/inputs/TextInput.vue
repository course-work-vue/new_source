<template>
  <labeled-input :label="label" :item-key="itemKey">
    <input-with-icon :icon="icon" :icon-right="iconRight">
      <InputText
        :type="types === 'text' ? 'text' : 'number'"
        :id="itemKey"
        v-model.lazy="model"
        :placeholder="placeholder"
        :class="inputClass"
        @input="handleInput"
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
      type: [String, Number],
    },
    placeholder: {
      type: String,
    },
    error: {
      type: String,
    },
    types: {
      type: String,
      default: "text",
    },
  },
  setup(props, { emit }) {
    const { inputClass } = useInputClass(props);
    const { model } = useModel(props, emit);

    const handleInput = (event) => {
      let value = event.target.value;
      if (props.types === "number") {
        value = value === "" ? null : Number(value); // Convert to number if applicable
      }
      emit("update:value", value); // Emit as number if needed
    };

    return { handleInput, inputClass, model };
  },
};
</script>
