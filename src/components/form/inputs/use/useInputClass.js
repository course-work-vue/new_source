import { computed } from 'vue';

/** Применение классов размера и ошибки, в зависимости от входных параметров */
export function useInputClass(props) {
    const inputClass = computed(() => ({
        'p-inputtext-sm': props.size === 'sm',
        'p-inputtext-lg': props.size === 'lg',
        'p-invalid': props.error,
    }));

    return {
        inputClass,
    };
}
