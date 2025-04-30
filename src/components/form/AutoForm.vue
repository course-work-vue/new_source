<template>
  <div
    v-for="item in scheme.items"
    :key="item.key"
    :class="[itemClass, `autoform-${item.key}`, 'autoform-item']"
  >
    <slot :name="item.key">
      <text-input
        v-if="item instanceof TEXT"
        :item-key="item.key"
        :value="modelValue[item.key]"
        :error="errors[item.key]"
        :label="item.label"
        :types="item.types"
        :icon="item.icon"
        :icon-right="item.iconRight"
        :size="item.size"
        :placeholder="item.placeholder"
        @update:value="update($event, item.key)"
      ></text-input>

      <time-picker-input
  v-if="item instanceof TIME"
  :item-key="item.key"
  :value="modelValue[item.key]"
  :error="errors[item.key]"
  :label="item.label"
  :placeholder="item.placeholder"
  @update:value="update($event, item.key)"
></time-picker-input>

      <mask-input
        v-if="item instanceof MASK"
        :item-key="item.key"
        :value="modelValue[item.key]"
        :error="errors[item.key]"
        :label="item.label"
        :icon="item.icon"
        :icon-right="item.iconRight"
        :size="item.size"
        :placeholder="item.placeholder"
        :mask="item.mask"
        @update:value="update($event, item.key)"
      ></mask-input>

      <date-input
        v-if="item instanceof DATE"
        :item-key="item.key"
        :value="modelValue[item.key]"
        :error="errors[item.key]"
        :label="item.label"
        :size="item.size"
        :show-icon="item.showIcon"
        :show-button-bar="item.showButtonBar"
        :min-date="item.minDate"
        :max-date="item.maxDate"
        :date-format="item.dateFormat"
        @update:value="update($event, item.key)"
      >
      </date-input>

      <checkbox-input
        v-if="item instanceof CHECKBOX"
        :item-key="item.key"
        :value="modelValue[item.key]"
        :error="errors[item.key]"
        :label="item.label"
        :binary="item.binary"
        @update:value="update($event, item.key)"
      >
      </checkbox-input>

      <radio-input
        v-if="item instanceof RADIO"
        :item-key="item.key"
        :value="modelValue[item.key]"
        :error="errors[item.key]"
        :label="item.label"
        :options="item.options"
        @update:value="update($event, item.key)"
      >
      </radio-input>

      <toggle-input
        v-if="item instanceof TOGGLE"
        :item-key="item.key"
        :value="modelValue[item.key]"
        :error="errors[item.key]"
        :label="item.label"
        :off-label="item.offLabel"
        :on-label="item.onLabel"
        :on-icon="item.onIcon"
        :off-icon="item.offIcon"
        @update:value="update($event, item.key)"
      >
      </toggle-input>

      <combobox-input
        v-if="item instanceof COMBOBOX"
        :item-key="item.key"
        :value="modelValue[item.key]"
        :error="errors[item.key]"
        :label="item.label"
        :options="item.options"
        :filter="item.filter"
        @update:value="update($event, item.key)"
      >
      </combobox-input>
    </slot>
  </div>
</template>

<script>
import TextInput from "@/components/form/inputs/TextInput.vue";
import TimePickerInput from "@/components/form/inputs/TimePickerInput.vue";
import MaskInput from "@/components/form/inputs/MaskInput.vue";
import DateInput from "@/components/form/inputs/DateInput.vue";
import CheckboxInput from "@/components/form/inputs/CheckboxInput.vue";
import RadioInput from "@/components/form/inputs/RadioEdit.vue";
import ToggleInput from "@/components/form/inputs/ToggleInput.vue";
import ComboboxInput from "@/components/form/inputs/ComboboxInput.vue";
import { FormScheme } from "@/model/form/FormScheme";

import { TextInput as TextInputModel } from "@/model/form/inputs/TextInput";
import { TimePickerInput as TimePickerInputModel } from "@/model/form/inputs/TimePickerInput";
import { MaskInput as MaskInputModel } from "@/model/form/inputs/MaskInput";
import { DateInput as DateInputModel } from "@/model/form/inputs/DateInput";
import { CheckboxInput as CheckboxInputModel } from "@/model/form/inputs/CheckboxInput";
import { RadioInput as RadioInputModel } from "@/model/form/inputs/RadioInput";
import { ToggleInput as ToggleInputModel } from "@/model/form/inputs/ToggleInput";
import { ComboboxInput as ComboboxInputModel } from "@/model/form/inputs/ComboboxInput";

export default {
  name: "AutoForm",
  components: {
    TextInput,
    TimePickerInput,
    MaskInput,
    DateInput,
    CheckboxInput,
    RadioInput,
    ToggleInput,
    ComboboxInput,
  },
  props: {
    scheme: {
      validator: (scheme) => {
        return scheme instanceof FormScheme;
      },
    },
    modelValue: {
      type: Object,
    },
    errors: {
      type: Object,
    },
    valid: {
      type: Boolean,
    },
    itemClass: {
      type: String,
    },
  },
  data() {
    return {
      TEXT: TextInputModel,
      TIME: TimePickerInputModel,
      MASK: MaskInputModel,
      DATE: DateInputModel,
      CHECKBOX: CheckboxInputModel,
      RADIO: RadioInputModel,
      TOGGLE: ToggleInputModel,
      COMBOBOX: ComboboxInputModel,
    };
  },
  methods: {
    update(v, key) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [key]: v,
      });
      const item = this.scheme.item(key);
      if (item.validate) {
        const error = item.validate(v);

        if (typeof error === "string") {
          this.$emit("update:errors", {
            ...this.errors,
            [key]: error,
          });
          this.$emit("update:valid", false);
        } else {
          const e = {
            ...this.errors,
          };
          delete e[key];

          this.$emit("update:errors", e);
          if (!Object.keys(e).length) {
            this.$emit("update:valid", true);
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.autoform-item {
  transition: all 0.3s ease;
  position: relative;
  padding-bottom: 1.5rem; /* Space for error message */
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber),
:deep(.p-checkbox),
:deep(.p-radiobutton),
:deep(.p-togglebutton) {
  border-radius: 0.375rem;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-dropdown:focus),
:deep(.p-calendar:focus),
:deep(.p-inputnumber:focus),
:deep(.p-checkbox:focus),
:deep(.p-radiobutton:focus),
:deep(.p-togglebutton:focus) {
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 103, 58, 183), 0.2);
  border-color: var(--primary-color, #673AB7);
}

:deep(.p-inputgroup) {
  display: flex;
  align-items: center;
}

:deep(.p-inputgroup-addon),
:deep(.p-inputtext-icon-right),
:deep(.p-inputtext-icon-left) {
  padding: 0 0.75rem;
  display: inline-flex;
  align-items: center;
}

:deep(.p-inputgroup .p-inputtext) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  flex: 1;
}

:deep(.p-inputgroup .p-inputgroup-addon) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 0;
}

:deep(.p-float-label) {
  margin-bottom: 0.5rem;
  width: 100%;
}

:deep(.p-component) {
  font-family: var(--font-family, 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}

:deep(.p-checkbox),
:deep(.p-radiobutton) {
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
}

:deep(.p-field-label) {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color-secondary, #6c757d);
}

:deep(.p-error) {
  color: var(--error-color, #f44336);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 1.25rem; /* Fixed height for error message */
  opacity: 1;
  transition: opacity 0.2s ease;
}

/* Hide error message space when no error */
:deep(.p-error:empty) {
  opacity: 0;
}

/* Fix for jumping elements during validation */
:deep(.p-field) {
  position: relative;
}

:deep(.p-inputtext) {
  padding: 0.75rem;
}

:deep(.p-button) {
  border-radius: 0.375rem;
}

/* Ensure icon and input are on same line */
:deep(.p-input-icon-left),
:deep(.p-input-icon-right) {
  display: inline-flex;
  position: relative;
  width: 100%;
}

:deep(.p-input-icon-left > i),
:deep(.p-input-icon-right > i) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

:deep(.p-input-icon-left > i) {
  left: 0.75rem;
}

:deep(.p-input-icon-right > i) {
  right: 0.75rem;
}

:deep(.p-input-icon-left > .p-inputtext) {
  padding-left: 2.5rem;
}

:deep(.p-input-icon-right > .p-inputtext) {
  padding-right: 2.5rem;
}
</style>
