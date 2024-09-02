<template>
    <small
        v-if="error"
        class="p-error"
    >
        {{ error || '&nbsp;' }}
    </small>
</template>

<script>
export default {
    name: 'InputError',
    props: {
        error: {
            type: String,
        },
    },
};
</script>
