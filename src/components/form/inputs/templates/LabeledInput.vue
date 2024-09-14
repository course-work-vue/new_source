<template>
  <label v-if="label" :for="itemKey" class="mb-2 block font-medium">
    {{ label }}
  </label>
  <slot> </slot>
</template>

<script>
export default {
  name: "LabeledInput",
  props: {
    itemKey: {
      type: String,
    },
    label: {
      type: String,
    },
  },
};
</script>
