<template>
  <label v-if="label" :for="itemKey" class="mb-2 block font-medium" v-html="formattedLabel"></label>
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
  computed: {
    formattedLabel() {
      // Заменяем \n на <br>
      return this.label ? this.label.replace(/\n/g, '<br>') : '';
    }
  }
};
</script>
