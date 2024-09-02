<template>
    <div
        v-if="icon"
        class="flex flex-column gap-2 mb-1"
    >
        <div
            v-if="icon"
            :class="iconPositionClass"
        >
            <i :class="icon"></i>
            <slot></slot>
        </div>
    </div>
    <slot v-else></slot>
</template>

<script>
export default {
    name: 'InputWithIcon',
    props: {
        icon: {
            type: String,
        },
        iconRight: {
            type: Boolean,
        },
    },
    computed: {
        iconPositionClass() {
            return this.iconRight ? 'p-input-icon-right' : 'p-input-icon-left';
        },
    },
};
</script>
