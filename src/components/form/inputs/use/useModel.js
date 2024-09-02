import { computed } from 'vue';

/** Механизм работы модели для элементов автоформы */
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
