<template>
    <!--  https://www.primefaces.org/primeflex/display -->
    <!--  https://www.primefaces.org/primeflex/padding -->
    <!--  https://www.primefaces.org/primeflex/fontweight -->
    <label
        v-if="label"
        :for="itemKey"
        class="mb-2 block font-medium"
    >
        {{ label }}
    </label>
    <slot> </slot>
</template>

<script>
export default {
    name: 'LabeledInput',
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
