import { computed } from 'vue';


export function useModel(props, emit) {
    const model = computed({
        get() {
            return props.value;
        },
        set(v) {
            emit('update:value', v);
        },
    });

    return {
        model,
    };
}
