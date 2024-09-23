<template>
    <div class="border border-success rounded-1 bg-white p-3">
        <div class=""><h3>Дисциплина: <b>{{ subject.subject_name }}</b></h3></div>
        <div>
            <div class="">Направление: <b>{{ dir.dir_name }}</b></div>
            <div class="">
            Группа:
            <span v-if="subject.subject_id" @click="change('Выбрать группу', groups, 'group');">
                <button class="btn border-success p-1">
                Выбрать
                </button>
            </span>
            </div>
            <div class="">
            Тип занятия: <b>{{ subject.sub_type }}</b>
            </div>
            <div class="">
            Тип аудитории:
            <span v-if="subject.subject_id" @click="change('Выбрать тип аудитории', [], 'audit')">
                <button class="btn border-success p-1">
                Выбрать
                </button>
            </span>
            </div>
            <div class="">
            Преподаватель:
            <span v-if="subject.subject_id" @click="change('Выбрать преподавателя', [], 'teacher')">
                <button class="btn border-success p-1">
                Выбрать
                </button>
            </span>
            </div>
        </div>
        <ScheduleSelectorCard
            :title="modalTitle"
            :rows="modalRows"
            :type="modalType"
            v-if="modalTitle!='1'"
        >
        </ScheduleSelectorCard>
    </div>
</template>

<script setup>
import ScheduleSelectorCard from './ScheduleSelectorCard.vue';
import { ref } from 'vue';

const modalTitle = ref('1');
const modalRows = ref({});
const modalType = ref(' ');

const change = (title, rows, type) => {
    modalTitle.value = title;
    modalRows.value = rows;
    modalType.value = type;
};

const props = defineProps({
    subject: Object,
    dir: Object,
    groups: [{}],
});
</script>


<style lang="scss" scoped>
    .btn:hover{
        background-color: rgba(0, 0, 0, 0.07);
        opacity: 0.8;
    }

</style>