<template>
  <div
    v-for="item in scheme.items"
    :key="item.key"
    :class="[itemClass, `autoform-${item.key}`]"
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

      <textarea-input
        v-if="item instanceof TEXTAREA"
        :item-key="item.key"
        :value="modelValue[item.key]"
        :error="errors[item.key]"
        :label="item.label"
        :placeholder="item.placeholder"
        :rows="item.rows"        
        :class-name="item.className"  
        @update:value="update($event, item.key)"
      ></textarea-input>
      
    </slot>
  </div>
</template>

<script>
import TextInput from "@/components/form/inputs/TextInput.vue";
import TextareaInput from "@/components/form/inputs/TextareaInput.vue";
import TimePickerInput from "@/components/form/inputs/TimePickerInput.vue";
import MaskInput from "@/components/form/inputs/MaskInput.vue";
import DateInput from "@/components/form/inputs/DateInput.vue";
import CheckboxInput from "@/components/form/inputs/CheckboxInput.vue";
import RadioInput from "@/components/form/inputs/RadioEdit.vue";
import ToggleInput from "@/components/form/inputs/ToggleInput.vue";
import ComboboxInput from "@/components/form/inputs/ComboboxInput.vue";
import { FormScheme } from "@/model/form/FormScheme";

import { TextInput as TextInputModel } from "@/model/form/inputs/TextInput";
import { TextareaInput as TextareaInputModel } from "@/model/form/inputs/TextareaInput";
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
    TextareaInput,
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
      TEXTAREA: TextareaInputModel,
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
