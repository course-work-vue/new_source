<template>
    <labeled-input
        :label="label"
        :item-key="itemKey"
    >
        <!-- https://primevue.org/calendar/-->
        <Calendar
            v-model="model"
            :class="inputClass"
            :date-format="dateFormat"
            :min-date="minDate"
            :max-date="maxDate"
            :show-icon="showIcon"
            :show-button-bar="showButtonBar"
        >
        </Calendar>
    </labeled-input>
    <input-error :error="error"></input-error>
</template>

<script>
import LabeledInput from '@/components/form/inputs/templates/LabeledInput.vue';
import InputError from '@/components/form/inputs/templates/InputError.vue';
import { useInputClass } from '@/components/form/inputs/use/useInputClass';
import { useModel } from '@/components/form/inputs/use/useModel';


export default {
    name: 'DateEdit',
    components: { LabeledInput, InputError },
    props: {
        itemKey: {
            type: String,
        },
        label: {
            type: String,
        },
        size: {
            default: 'md',
            type: String,
        },
        value: {},
        error: {
            type: String,
        },
        dateFormat: {
            type: String,
        },
        minDate: {},
        maxDate: {},
        showIcon: {
            type: Boolean,
        },
        showButtonBar: {
            type: Boolean,
        },
    },
    setup(props, { emit }) {
        const { inputClass } = useInputClass(props);
        const { model } = useModel(props, emit);

        return { inputClass, model };
    },
};
</script>
