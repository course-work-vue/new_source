import { computed } from 'vue';


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
