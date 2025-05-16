<template>
    <div class="sched col">
        <div class="col align-self-end">
            <div class="d-flex mb-2 gap-2">
                <select 
                    class="form-select flex-grow-1" 
                    v-model.number="selectedCourse" 
                    @change="handleCourseChange"
                >
                    <option value=1>1 курс</option>
                    <option value=2>2 курс</option>
                    <option v-if="isMag === '0'" value=3>3 курс</option>
                    <option v-if="isMag === '0'" value=4>4 курс</option>
                </select>
                
                <select 
                    class="form-select flex-grow-1" 
                    v-model.number="selectedSem" 
                    @change="handleSemesterChange"
                >
                    <option value=1>1 семестр</option>
                    <option value=2>2 семестр</option>
                </select>
            </div>

            <div class="d-flex gap-3 mb-3">
                <div class="form-check">
                    <input 
                        class="form-check-input" 
                        type="radio" 
                        value="1" 
                        v-model="isMag"
                    >
                    <label class="form-check-label">Магистратура</label>
                </div>
                <div class="form-check">
                    <input 
                        class="form-check-input" 
                        type="radio" 
                        value="0" 
                        v-model="isMag"
                        checked
                    >
                    <label class="form-check-label">Бакалавриат</label>
                </div>
            </div>    
        </div>

        <div class="d-flex gap-2">
            <!-- Направления -->
            <div class="col-2">
                <table class="table w-100">
                    <thead class="table-light">
                        <tr><th>Направление</th></tr>
                    </thead>
                    <tbody>
                        <tr 
                            v-for="dir in filteredDirs" 
                            :key="dir.dir_id"
                            @click="selectDirection(dir)"
                        >
                            <th :class="{ 'table-active': selectedDir.dir_id === dir.dir_id }">
                                {{ dir.dir_code }}
                            </th>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Предметы -->
            <div class="col-4">
                <table class="table w-100" v-if="filteredSubjects.length && showSubjects">
                    <thead class="table-light">
                        <tr><th>Предмет</th></tr>
                    </thead>
                    <tbody>
                        <tr 
                            v-for="subject in filteredSubjects" 
                            :key="subject.subject_id"
                            @click="selectSubject(subject)"
                        >
                            <th :class="{ 'table-active': selectedSubjectObj?.subject_id === subject.subject_id }">
                                {{ subject.subject_name }}
                            </th>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="text-muted p-2">
                    {{ subjectsMessage }}
                </div>
            </div>

            <!-- Детали -->
            <div class="col-6">
                <div class="border border-success rounded bg-white p-3">
                    <h3>Дисциплина: <b>{{ selectedSubjectObj.subject_name || 'Не выбрана' }}</b></h3>
                    
                    <div class="mb-3">
                        <span class="me-2">Направление:</span>
                        <b>{{ selectedDir.dir_name || 'Не выбрано' }}</b>
                    </div>

                    <div class="mb-3">
                        <span class="me-2">Тип занятия:</span>
                        <b>{{ selectedSubjectObj?.sub_type || 'Не выбрано' }}</b>
                    </div>

                    <div class="mb-3">
                        <span class="me-2">Кол-во часов:</span>
                        <b>{{ selectedSubjectObj?.hours || 'Не выбрано' }}</b>
                    </div>
                    
                    <!-- <div class="mb-3">
                        <span class="me-2">Кол-во часов:</span>
                        <b>{{ selectedSubjectObj?.hours || 'Не выбрано' }}</b>
                    </div> -->

                    <div class="row p-1">
                        <!-- <div class="col-7 d-flex gap-4 align-items-center p-2">
                            <h5 class="mb-0">Группа:</h5>
                            <select 
                                required
                                class="form-select"
                                v-model="selectedGroupId"
                                :disabled="!selectedSubjectObj.subject_id"
                            >
                            
                                <option value="" disabled selected hidden>Выберите группу</option>
                                <option 
                                    v-for="group in filteredGroups" 
                                    :key="group.group_id"
                                    :value="group.group_id"
                                >
                                    {{ group.group_number }}
                                </option>
                            </select>

                        </div> -->

                        <!-- <div class="mb-3">
                            <span>Тип занятия: <b>{{ getSubjectType() || 'Не указан' }}</b></span>
                        </div> -->

                        <!-- <div class="col-8 d-flex p-1">
                            <button 
                                class="btn btn-primary"
                                @click="openSelector('audit', 'Тип аудитории', audTypes)"
                                :disabled="!selectedSubjectObj.id"
                            >
                                Аудитория: {{ selectedAudObj.value || 'Не выбрана' }}
                            </button>
                            
                            <button 
                                class="btn btn-primary"
                                @click="openSelector('teacher', 'Преподаватель', teachers)"
                                :disabled="!selectedSubjectObj.subject_id"
                                >
                                Преподаватель: {{ selectedTeacherObj.last_name || 'Не выбран' }}
                                <span v-if="teachers.length === 0">(Нет доступных преподавателей)</span>
                            </button>
                        </div>-->
                    </div> 

                    <div class="mb-3">
                        <h5>Преподаватели: {{ teachersSelectionStatus }}</h5>
                        <div v-if="allTeachers.length">
                            
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Преподаватель</th>
                                        <th>Нагрузка</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr 
                                        v-for="teacher in allTeachers" 
                                        :key="teacher.teacher_id"
                                        :class="{ 'table-active': isTeacherSelected(teacher) }"
                                    >
                                        <td>{{ formatTeacherName(teacher) }}</td>
                                        <td>
                                            <span class="" :class="{
                                                'bg-primary': getTeacherWorkloadDetails(teacher.teacher_id).total > 0,
                                                'bg-secondary': getTeacherWorkloadDetails(teacher.teacher_id).total === 0
                                            }">
                                                {{ getTeacherWorkloadDetails(teacher.teacher_id) }} ч
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                class="btn btn-sm btn-outline-warning me-2"
                                                @click="showTeacherDetails(teacher)"
                                            >
                                                Подробнее
                                            </button>
                                            <button 
                                                class="btn btn-sm"
                                                :class="isTeacherSelected(teacher) ? 'btn-outline-danger' : 'btn-outline-success'"
                                                @click="toggleTeacherSelection(teacher)"
                                                :disabled="!isTeacherSelectionAvailable(teacher)"
                                            >
                                                {{ isTeacherSelected(teacher) ? 'Отменить' : 'Выбрать' }}
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-else class="text-muted">
                            Нет доступных преподавателей для выбранной дисциплины
                        </div>
                    </div>
                    
                    <!-- <div class="mb-3">
                        <h5>{{ teachersSelectionStatus }}</h5>
                        <div v-if="selectedTeachers.length" class="d-flex flex-wrap gap-2 mt-2">
                            <span 
                                v-for="teacher in selectedTeachers" 
                                :key="teacher.teacher_id"
                                class="badge bg-primary"
                            >
                                {{ formatTeacherName(teacher) }}
                                <button 
                                    class="btn-close btn-close-white ms-2"
                                    @click.stop="toggleTeacherSelection(teacher)"
                                    aria-label="Удалить"
                                ></button>
                            </span>
                        </div>
                        <div v-else class="text-muted">
                            Преподаватели не выбраны
                        </div>
                    </div> -->



                    <div 
                        v-if="showSelector" 
                        class="card border-success mt-3"
                    >
                        <div class="card-header bg-success text-white">
                            <b>{{ modalTitle }}</b>
                            <button 
                                class="btn btn-close btn-close-white" 
                                @click="showSelector = false"
                                aria-label="Закрыть"
                            ></button>
                        </div>
                        <div class="card-body">
                            <div class="d-flex flex-wrap gap-2">
                                <button 
                                    v-for="item in modalItems" 
                                    :key="item.id"
                                    class="btn btn-outline-success"
                                    @click="selectItem(item)"
                                >
                                    {{ item.label || item.value }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- <div class="mt-3">
                    <button 
                        class="btn btn-primary btn-block"
                        @click="saveRel"
                        :disabled="!isFormValid"
                    >
                        Сохранить связь
                    </button>
                </div> -->
            </div>
        </div>

        <transition name="fade">
            <div 
                :class="notificationClass" 
                class="alert position-fixed bottom-0 end-0 m-3"
                v-if="showNotificationFlag"
            > 
                {{ notifyText }}
            </div>
        </transition>

        <div class="relbtn mt-4 fixed-bottom left-5 mb-3" style="z-index: 1000; width: auto;">
            <button 
                class="btn btn-primary shadow"
                @click="saveRel"
                :disabled="!isFormValid"
            >
                <i class="bi bi-save me-2"></i>
                Сохранить связь
            </button>
        </div>

        <!-- <div class="input-group mb-4 ml-5">
            <input 
                type="text" 
                class="form-control"
                placeholder="Введите текст"
                v-model="q"
                @keyup.enter="query(q)"
            >
                <button 
                    class="btn btn-primary"
                    @click="query(q)"
                >
                    Отправить
                </button>
        </div> -->
        
        <!-- <div v-for="e in this.workloads">
            {{ e }}
        </div> -->

        <!-- Собственное модальное окно без Bootstrap -->
        <div class="custom-modal" v-if="showTeacherModal">
        <div class="modal-overlay" @click="showTeacherModal = false"></div>
        <div class="modal-content">
            <div class="modal-header">
            <h3>
                Нагрузка преподавателя: {{ detailedTeacher.last_name }} 
                {{ detailedTeacher.first_name?.[0] }}.{{ detailedTeacher.patronymic?.[0] }}.
            </h3>
            <button class="close-btn" @click="showTeacherModal = false">×</button>
            </div>
            <div class="modal-body">
            <table class="workload-table">
                <thead>
                <tr>
                    <th>Дисциплина</th>
                    <th>Тип занятия</th>
                    <th>Часы</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="subject in detailedTeacherWorkload" :key="subject.subject_id">
                    <td>{{ subject.subject_name }}</td>
                    <td>{{ subject.sub_type }}</td>
                    <td>{{ subject.hours }} ч</td>
                </tr>
                <tr v-if="!detailedTeacherWorkload.length">
                    <td colspan="3" class="no-data">Нет назначенных дисциплин</td>
                </tr>
                </tbody>
                <tfoot v-if="detailedTeacherWorkload.length">
                <tr class="total-row">
                    <td>Итого:</td>
                    <td></td>
                    <td>{{ detailedTeacherWorkload.reduce((sum, s) => sum + s.hours, 0) }} ч</td>
                </tr>
                </tfoot>
            </table>
            </div>
        </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useDirectionStore } from "@/store2/studentgroup/direction";
import { useGroupStore } from "@/store2/studentgroup/group";
import UserService from "../services/user.service";

export default {
    data() {
        return {
            showSubjects: false,
            selectedCourse: 1,
            selectedSem: 1,
            isMag: '0',
            audTypes: [
                { id: 0, value: 'лекционная' },
                { id: 1, value: 'семинарная' },
                { id: 2, value: 'компьютерный класс' }
            ],
            selectedDir: {},
            selectedSubject: '',
            selectedSubjectObj: {},
            selectedGroupObj: {},
            selectedAudObj: {},
            selectedTeacherObj: null,
            subjects: [],
            groups: [],
            teachers: [],
            selectedTeachers: [],
            allTeachers: [], // вместо teachers
            workloads: [], // для хранения всех нагрузок

            tgz: [],
            showSelector: false,
            modalTitle: '',
            modalItems: [],
            modalType: '',
            notifyText: '',
            notifyType: 'success',
            showNotificationFlag: false,
            subjectsMessage: 'Выберите направление',
            q: ``,
            programs: [], 
            subjectsList: [],
            filt_subjects: [],
            i_disciples: [],
            rowData: [],
            selectedGroupId: "",
            detailedTeacher: {},
            detailedTeacherWorkload: [],
            showTeacherModal: false 
        };
    },

    computed: {
        ...mapState(useDirectionStore, ["directionList"]),
        ...mapState(useGroupStore, ["groupList"]),
        filteredDirs() {
            return this.directionList
                .filter(d => d.deleted_at === null && d.magister == this.isMag)
                .sort((a, b) => a.dir_name.localeCompare(b.dir_name));
        },

        filteredGroups() {
            if (!this.selectedDir?.dir_id || !this.selectedCourse) return [];           
            // console.log(this.groups);
            let ret = this.groups.filter(g => 
                g.group_dir_id === this.selectedDir.dir_id &&
                g.course === this.selectedCourse
            );
            // console.log(ret);
            return ret;
        },

        
        notificationClass() {
            return {
                'alert-success': this.notifyType === 'success',
                'alert-warning': this.notifyType === 'warning',
                'alert-danger': this.notifyType === 'error'
            };
        },
        // isFormValid() {
        //     return this.selectedGroupId 
        //         && this.selectedTeacherObj?.teacher_id;
        // },

        isFormValid() {
            return this.selectedSubjectObj?.subject_id && 
                this.isTeachersSelectionValid;
        },


        absoluteSemester() {
            return (this.selectedCourse - 1) * 2 + this.selectedSem;
        },

        filteredSubjects() {
            // console.log(this.selectedProgram?.id);
            
            if (!this.selectedProgram?.id || !this.subjectsList?.length) return [];

            const ggg = this.subjectsList.filter(subject => 
                subject.program_id === this.selectedProgram.id &&
                subject.sub_type !== 'Лекционное занятие' &&
                subject.semester === this.absoluteSemester &&
            subject.department === 'Информационных технологий'
            );

            console.log('Фильтр предметов:', ggg);
                        
            return ggg;
        },

        selectedProgram() {
            if (!this.selectedDir?.dir_code || !this.programs?.length) return null;
            return this.programs.find(p => p.code === this.selectedDir.dir_code);
        },

        selectedGroupObj() {
            return this.filteredGroups.find(g => g.group_id === this.selectedGroupId) || {};
        },

        selectedTeachersNames() {
            return this.selectedTeachers
                .map(t => this.formatTeacherName(t))
                .join(', ');
        },

        maxTeachersAllowed() {
            if (!this.selectedSubjectObj?.sub_type) return 0;
            
            if (this.selectedSubjectObj.sub_type === 'Лабораторное занятие') {
                return this.filteredGroups.length || 0;
            }
            if (this.selectedSubjectObj.sub_type === 'Практическое занятие') {
                return 1;
            }
            return 0;
        },

            teachersSelectionStatus() {
                return `[${this.selectedTeachers.length}/${this.maxTeachersAllowed}]:`;
        },

        isTeachersSelectionValid() {
            return this.selectedTeachers.length > 0 && 
                this.selectedTeachers.length <= this.maxTeachersAllowed;
        },

        currentSubjectWorkloads() {
            return this.workloads.filter(w => 
                w.subject_id === this.selectedSubjectObj?.subject_id &&
                !w.deleted_at
            );
        },
        
        // Суммарная нагрузка преподавателя по всем дисциплинам
        teacherWorkloads() {
            const result = {};
            this.workloads
                .filter(w => !w.deleted_at)
                .forEach(w => {
                    if (!result[w.teacher_id]) {
                        result[w.teacher_id] = 0;
                    }
                    result[w.teacher_id] += 1; // или w.hours, если есть поле с часами
                });
            return result;
        },
        
        // ID уже выбранных преподавателей для текущей дисциплины
        selectedTeacherIds() {
            return this.currentSubjectWorkloads.map(w => w.teacher_id);
        },

        totalTeacherHours() {
            return this.detailedTeacherWorkload.reduce((sum, subject) => sum + subject.hours, 0);
        },

        
        // filteredDisciples() {
        //     if (!this.i_disciples?.length || 
        //         !this.selectedDir?.dir_code || 
        //         !this.programs?.length) return [];

        //     // Находим программу по коду направления
        //     const program = this.programs.find(p => p.code === this.selectedDir.dir_code);
            
        //     if (!program) return [];

        //     // Фильтруем дисциплины
        //     return this.i_disciples.filter(d => 
        //         d.program_id === program.id &&
        //         d.kurs === this.selectedCourse &&
        //         d.semester === this.absoluteSemester
        //     );
        // }

        filteredDisciples() {

            // console.log(this.i_disciples?.length, this.selectedDir?.dir_code, this.programs?.length);
            
            
            if (!this.i_disciples?.length || 
                !this.selectedDir?.dir_code || 
                !this.programs?.length) return [];

            // console.log(123);
            

            const program = this.programs.find(p => p.code === this.selectedDir.dir_code);
            if (!program) return [];

            return this.subjectsList.filter(d => 
                d.program_id === program.id &&
                d.kurs === this.selectedCourse &&
                d.semester === this.absoluteSemester
            );
        }
    },

    watch: {
        isMag() {
            this.resetAllData();
        },

        selectedDir(newVal) {
            if (newVal.dir_id) {
                this.loadSubjects();
                // console.log(this.subjectsList);
                
            };

            // console.log('ProgramId:', this.selectedProgram?.id);
            
            if (!this.selectedProgram?.id || !this.subjectsList?.length) return [];

            const ggg = this.subjectsList.filter(subject => 
                subject.program_id === this.selectedProgram.id &&
                subject.sub_type !== 'Лекционное занятие' &&
                subject.semester === this.absoluteSemester &&
            subject.department === 'Информационных технологий'
            );

            console.log('Фильтр предметов:', ggg);
                        
            this.filt_subjects = ggg;
        },

        selectedCourse() {
            if (this.selectedDir.dir_code) {
                this.$forceUpdate();
            }
        },
        selectedSem() {
            if (this.selectedDir.dir_code) {
                this.$forceUpdate();
            }
        }

        // selectedCourse() {
        //     this.resetSelections();
        //     this.loadInitialData();
        // },

        // selectedSem() {
        //     this.resetSelections();
        //     this.loadInitialData();
        // }
    },

    async mounted() {
        await this.getDirectionList();
        await this.loadTeacherGruz();
        await this.loadSubjects(); // Загружаем предметы вместо дисциплин
        await this.loadPrograms(); // Загружаем программы
        await this.getGroupList(); // Получение списка групп

        this.groups = this.groupList;
        // console.log(this.groupList);
        
        this.loadInitialData();
    },

    methods: {
        ...mapActions(useDirectionStore, ["getDirectionList"]),
        ...mapActions(useGroupStore, [
            "getGroupList"
        ]),

        async loadPrograms() {
            try {
                const response = await UserService.getPrograms_imp();
                this.programs = response.data;                
            } catch (error) {
                console.error('Error loading programs:', error);
            }
        },

        isTeacherSelectionAvailable(teacher) {
            if (this.isTeacherSelected(teacher)) return true;
            
            if (this.selectedSubjectObj.sub_type === 'Практическое занятие') {
                return this.selectedTeachers.length < 1;
            }
            else if (this.selectedSubjectObj.sub_type === 'Лабораторное занятие') {
                return this.selectedTeachers.length < this.filteredGroups.length;
            }
            return true;
        },


        getSubjectType() {
            if (!this.selectedSubjectObj) return '';
            
            const d = this.selectedSubjectObj;
            if (d.lecture_hours > 0) return 'Лекция';
            if (d.practice_hours > 0) return 'Практика';
            if (d.lab_hours > 0) return 'Лабораторная работа';
            if (d.ksr_hours > 0) return 'КСР';
            if (d.ikr_hours > 0) return 'ИКР';
            return 'Другой тип';
        },

        formatTeacherName(teacher) {
            let initials = ''
            if (teacher.first_name) {
                initials += teacher.first_name[0] + '.'
                if (teacher.patronymic) {
                    initials += teacher.patronymic[0] + '.'
                }
            }
            return `${teacher.last_name} ${initials}`
        },

        selectTeacher(teacher) {
            this.selectedTeacherObj = teacher
        },

        showTeacherDetails(teacher) {
            // Сохраняем выбранного преподавателя
            this.detailedTeacher = teacher;
            
            // Формируем детальную нагрузку
            this.detailedTeacherWorkload = this.workloads
                .filter(w => 
                    w.teacher_id === teacher.teacher_id && 
                    w.deleted_at.length === undefined // или другое условие проверки на удаление
                )
                .map(w => {
                    const subject = this.subjectsList.find(s => s.subject_id === w.subject_id) || {};
                    return {
                        subject_id: w.subject_id,
                        subject_name: subject.subject_name || 'Неизвестная дисциплина',
                        sub_type: subject.sub_type || 'Не указан',
                        hours: subject.hours || 0
                    };
                })
                ;

            console.log('отрисовка', teacher.teacher_id, this.detailedTeacherWorkload);
            
            
            // Показываем модальное окно (просто устанавливаем флаг)
            this.showTeacherModal = true;
        },

        isTeacherSelected(teacher) {
            return this.selectedTeachers.some(t => t.teacher_id === teacher.teacher_id);
        },

        toggleTeacherSelection(teacher) {
            if (this.isTeacherSelected(teacher)) {
                // Удаление преподавателя из выбранных
                this.selectedTeachers = this.selectedTeachers.filter(
                    t => t.teacher_id !== teacher.teacher_id
                );
            } else {
                // Проверка на максимальное количество
                if (this.selectedTeachers.length >= this.maxTeachersAllowed) {
                    this.showNotification(
                        `Максимальное количество преподавателей: ${this.maxTeachersAllowed}`,
                        'warning'
                    );
                    return;
                }
                // Добавление преподавателя
                this.selectedTeachers.push(teacher);
            }
        },

        getSelectedTeachersForSubject(subjectId) {
            if (!this.workloads?.length) return [];

            const ggg = this.workloads
                .filter(w => 
                    w.subject_id === subjectId && 
                    w.deleted_at.length === undefined
                )
                .map(w => w.teacher_id);

            console.log(ggg);
                

            return 
        },
        
        getTeacherWorkloadDetails(teacherId) {
            if (!this.workloads?.length) return 0;

            const ggg = this.workloads
                .filter(w => 
                    w.teacher_id === teacherId && 
                    w.deleted_at.length === undefined
                )
                .reduce((sum, w) => {
                    const subject = this.subjectsList.find(s => s.subject_id === w.subject_id);
                    return sum + (subject ? subject.hours : 0);
                }, 0);
            

                // console.log(teacherId, ggg);
                

            return ggg;
        },







        resetSelections() {
    // Сбрасываем только связанные с предметом данные
            this.selectedSubjectObj = {};
            // this.selectedGroupObj = {};
            this.selectedGroupId = "";
            this.selectedAudObj = {};
            this.selectedTeacherObj = null;
        },

        resetAllData() {
            // Сбрасываем все связанные данные
            this.selectedCourse = 1;
            this.selectedDir = {};
            this.showSubjects = false;
            this.subjects = [];
            this.resetSelections();
            
            // Обновляем сообщение
            this.subjectsMessage = 'Загрузка направлений';
            
            // Перезагружаем начальные данные
            this.loadInitialData();
        },
        
 
        
        async loadInitialData() {
            if (this.selectedDir.dir_code) {
                await this.loadTeachers();
                this.showSubjects = true;
            }
        },

        async query(q){
            try {
                const response = await UserService.getQuery(q);
                console.log(response.data);

            } catch (error) {
                console.error('Error loading:', error);
            }
        },

        async loadTeacherGruz() {
            try {
                // const response = await UserService.getAllTeachGruz();
                
                const response = await UserService.getTeachGruzX();
                this.tgz = response.data;
                // console.log(this.tgz);
                
            } catch (error) {
                console.error('Error loading teacher gruz:', error);
            }
        },

        // async loadDisciples() {
        //     try {
        //         const response = await UserService.getDisciples();
        //         this.i_disciples = response.data;
        //     } catch (error) {
        //         console.error('Error loading disciples:', error);
        //     }
        // },

        async loadDisciples() {
            try {
                const response = await UserService.getDisciples();
                // Временно отобразим все дисциплины для тестирования
                this.i_disciples = response.data;
                // console.log('Все дисциплины:', this.i_disciples);
            } catch(error) {
                console.error('Error loading disciples:', error);
            }
        },



        // async loadSubjects() {
        //     if (!this.selectedCourse || !this.selectedSem) return;

        //     // Рассчитываем абсолютный семестр
        //     const absoluteSemester = (this.selectedCourse - 1) * 2 + this.selectedSem;
            
        //     // Фильтруем дисциплины по курсу и абсолютному семестру
        //     const filtered = this.i_disciples.filter(d => 
        //         d.kurs === this.selectedCourse && 
        //         d.semester === absoluteSemester
        //     );

        //     // Получаем уникальные названия дисциплин
        //     this.subjects = [...new Set(filtered.map(d => d.disciple_name))];
        // },

        async loadSubjects() {
            try {
                const response = await UserService.getAllSubjects();
                this.subjectsList = response.data;
                // console.log('Loaded subjects:', response.data);
                
            } catch (error) {
                console.error('Error loading subjects:', error);
            }
        },

       
        // async saveRel() {
        //     try {
        //         let group_id = this.selectedGroupId;
        //         let subject_id = this.selectedSubjectObj.subject_id;
        //         let teacher_id = this.selectedTeacherObj.teacher_id;
                            
        //         await UserService.addWorkload(group_id, subject_id, teacher_id);
        //         this.showNotification('Связь успешно сохранена', 'success');
        //         // this.resetDependentSelections();
                
        //     } catch (error) {
        //         console.error('Ошибка сохранения:', error);
        //         this.showNotification('Ошибка сохранения', 'error');
        //     }
        // },

        // async saveRel() {
        //     if (!this.isFormValid) return;

        //     try {
        //         // Сначала помечаем старые записи как удаленные
        //         await UserService.deleteWorkload(
        //             this.selectedGroupId,
        //             this.selectedSubjectObj.subject_id
        //         );

        //         // Затем создаем новые связи для каждого выбранного преподавателя
        //         for (const teacher of this.selectedTeachers) {
        //             await UserService.addWorkload(
        //                 this.selectedGroupId,
        //                 this.selectedSubjectObj.subject_id,
        //                 teacher.teacher_id
        //             );
        //         }

        //         this.showNotification('Связи успешно обновлены', 'success');
        //         this.selectedTeachers = [];
        //         await this.loadTeachers(); // Обновляем список преподавателей
        //     } catch (error) {
        //         console.error('Ошибка сохранения:', error);
        //         this.showNotification('Ошибка обновления связей', 'error');
        //     }
        // },


        async saveRel() {
            if (!this.isFormValid) return;

            try {
                // Помечаем старые записи как удаленные
                await UserService.deleteWorkload(
                    this.selectedSubjectObj.subject_id
                );

                // Создаем новые связи
                for (const teacher of this.selectedTeachers) {
                    await UserService.addWorkload(
                        // group_id не указываем
                        this.selectedSubjectObj.subject_id,
                        teacher.teacher_id
                    );
                }

                // Обновляем локальное хранилище нагрузок
                const response = await UserService.getAllWorkloads();
                this.workloads = response.data;
                
                this.showNotification('Связи успешно обновлены', 'success');
            } catch (error) {
                console.error('Ошибка сохранения:', error);
                this.showNotification('Ошибка обновления связей', 'error');
            }
        },


        getTeacherWorkload(teacherId) {
            if (!this.workloads?.length) return 0;
            
            const activeHours = this.workloads
                .filter(w => 
                    w.teacher_id === teacherId &&
                    w.deleted_at.length === undefined
                )
                .reduce((sum, w) => sum + (w.hours || 0), 0);
            
            return activeHours;
        },

        resetDependentSelections() {
            // this.selectedGroupObj = {};
            this.selectedGroupId = "";
            this.selectedTeacherObj = null;
            this.selectedAudObj = {};
        },

        // async saveRel() {
        //     if (!this.isFormValid) return;

        //     try {
        //         const groupId = this.selectedGroupObj.group_id;
        //         const subjectId = this.selectedSubjectObj.subject_id;
        //         const teacherId = this.selectedTeacherObj.teacher_id;
        //         const auditType = this.selectedAudObj.value;

        //         const existing = await this.findWorkload(groupId, subjectId);
                
        //         if (existing === -1) {
        //             await UserService.addWorkload(groupId, subjectId, teacherId, auditType);
        //             this.showNotification('Преподаватель добавлен', 'success');
        //         } else if (existing !== teacherId) {
        //             const wlId = await this.findWorkloadId(groupId, subjectId);
        //             await UserService.editWorkload(wlId, teacherId, auditType);
        //             this.showNotification('Преподаватель обновлен', 'warning');
        //         } else {
        //             this.showNotification('Преподаватель уже назначен', 'error');
        //             return;
        //         }

        //         await this.loadTeachers();
        //         this.resetSelections();

        //     } catch (error) {
        //         console.error('Ошибка сохранения:', error);
        //         this.showNotification('Ошибка сохранения', 'error');
        //     }
        // },

        showNotification(text, type) {
            this.notifyText = text;
            this.notifyType = type;
            this.showNotificationFlag = true;
            setTimeout(() => {
                this.showNotificationFlag = false;
            }, 3000);
        },


        async findWorkload() {
            try {
                // Получаем и сохраняем все нагрузки
                const response = await UserService.getAllWorkloads();
                this.workloads = response.data;

                // console.log(this.workloads);
                // console.log(this.selectedSubjectObj.subject_id);

                // this.workloads.forEach(element => {
                //     console.log(element.deleted_at.length === undefined);
                    
                // });                

                const ggg = this.workloads
                    .filter(w => 
                        w.deleted_at.length === undefined &&
                        // w.group_id === this.selectedGroupId &&
                        w.subject_id == this.selectedSubjectObj.subject_id
                    );

                // console.log(ggg);
                                               
                // Возвращаем только активные нагрузки (без deleted_at) для текущей группы и предмета
                return ggg;
            } catch (error) {
                console.error('Ошибка получения нагрузок:', error);
                this.workloads = [];
                return [];
            }
        },

        async findWorkloadId(groupId, subjectId) {
            try {
                const response = await UserService.getWorkloads();
                const workload = response.data.find(w => 
                    w.group_id === groupId && 
                    w.subject_id === subjectId
                );
                return workload ? workload.wl_id : null;
            } catch (error) {
                console.error('Ошибка поиска ID нагрузки:', error);
                return null;
            }
        },


        // async selectDirection(dir) {
        //     this.selectedDir = dir;
        //     this.resetSelections();

        //     // console.log(dir);
            
            
        //     // Перезагружаем данные при изменении направления
        //     if (dir.dir_code) {                
        //         await this.loadSubjects();
                
        //         await this.loadGroups();
        //     }
        // },

        async selectDirection(dir) {
            this.selectedDir = dir;
            this.resetSelections();
            this.showSelector = false;
            await this.loadDisciples(); // Добавляем загрузку дисциплин
            await this.loadInitialData();
            // this.$forceUpdate();
        },

        // async selectDirection(dir) {
        //     this.selectedDir = dir;
        //     this.resetSelections();
        //     // this.showSelector = false; // Закрываем все модальные окнан
        //     this.loadInitialData();
        // },



        // async selectSubject(subjectName) {
        //     this.resetSelections(); // Сбрасываем выбор
        //     this.selectedSubject = subjectName;
        //     try {
        //         const response = await UserService.getAllSubjects();
        //         this.selectedSubjectObj = response.data.find(s => s.subject_name === subjectName) || {};
        //         await this.loadTeachers();
        //     } catch (error) {
        //         console.error('Error loading subject:', error);
        //     }
        // },

        // async selectSubject(disciple) {
        //     this.selectedSubjectObj = disciple;
        //     this.showSelector = false; // Закрываем все модальные окна
        //     this.resetDependentSelections();
        //     this.loadTeachers();
        // },

        async selectSubject(subject) {
            this.selectedSubjectObj = subject;
            this.resetDependentSelections();
            this.showSelector = false;
            await this.loadTeachers();
        },


        // async loadTeachers() {
        //     try {
        //         const response = await UserService.getAllTeachers();
        //         const teachersForSubject = this.tgz
        //             .filter(t => t.discipline_id === this.selectedSubjectObj.id)
        //             .map(t => t.fam);
                
        //         this.teachers = response.data
        //             .filter(t => teachersForSubject.includes(t.last_name));
        //     } catch (error) {
        //         console.error('Error loading teachers:', error);
        //     }
        // },

        // async loadTeachers() {
        //     try {
        //         // Получаем всех преподавателей
        //         const teachersResponse = await UserService.getAllTeachers();
        //         const allTeachers = teachersResponse.data;

        //         // Фильтруем связи tgz по выбранной дисциплине
        //         const teacherIds = this.tgz
        //             .filter(t => t.disciple_id === this.selectedSubjectObj.disciple_id)
        //             .map(t => t.teacher_id);

        //         // Убираем дубликаты и фильтруем преподавателей
        //         this.teachers = allTeachers.filter(t => 
        //             [...new Set(teacherIds)].includes(t.teacher_id)
        //         );

        //         // console.log(allTeachers);
        //         // console.log(teacherIds);
                
                

        //     } catch (error) {
        //         console.error('Error loading teachers:', error);
        //         this.teachers = [];
        //     }
        // },

        // async loadTeachers() {
        //     try {
        //         // Получаем всех преподавателей
        //         const teachersResponse = await UserService.getAllTeachers();
        //         this.allTeachers = teachersResponse.data;

        //         // Получаем активные нагрузки для текущей группы и предмета
        //         const activeTeacherIds = await this.findWorkload(
        //             this.selectedGroupId,
        //             this.selectedSubjectObj.subject_id
        //         );

        //         // Предварительно выбираем преподавателей с активными нагрузками
        //         this.selectedTeachers = this.allTeachers.filter(teacher =>
        //             activeTeacherIds.includes(teacher.teacher_id)
        //         );

        //     } catch (error) {
        //         console.error('Error loading teachers:', error);
        //         this.allTeachers = [];
        //         this.selectedTeachers = [];
        //     }
        // },

        // async loadTeachers() {
        //     try {
        //         // Получаем всех преподавателей
        //         const teachersResponse = await UserService.getAllTeachers();
        //         this.allTeachers = teachersResponse.data;

        //         // Получаем активные нагрузки для текущей группы и предмета
        //         const activeWorkloads = await this.findWorkload();

        //         // Предварительно выбираем преподавателей с активными нагрузками
        //         this.selectedTeachers = this.allTeachers.filter(teacher =>
        //             activeWorkloads.some(w => w.teacher_id === teacher.teacher_id)
        //         );

        //     } catch (error) {
        //         console.error('Error loading teachers:', error);
        //         this.allTeachers = [];
        //         this.selectedTeachers = [];
        //     }
        // },

        async loadTeachers() {
            try {
                // Получаем всех преподавателей
                const teachersResponse = await UserService.getAllTeachers();
                this.allTeachers = teachersResponse.data;

                const activeWorkloads = await this.findWorkload();

                // console.log(activeWorkloads);
                

                // Предварительно выбираем преподавателей
                this.selectedTeachers = this.allTeachers.filter(teacher =>
                    activeWorkloads.some(w => w.teacher_id === teacher.teacher_id)
                );

            } catch (error) {
                console.error('Error loading teachers:', error);
                this.allTeachers = [];
                this.selectedTeachers = [];
            }
        },



        openSelector(type, title, items) {

            console.log(title, items);
            

            this.modalType = type;
            this.modalTitle = title;
            this.modalItems = items.map(item => ({
                id: item[`${type}_id`] || item.id,
                label: item.last_name || item.value || item.group_number,
                ...item
            }));
            this.showSelector = true;
        },

        selectItem(item) {
            const selectors = {
                group: () => this.selectedGroupObj = item,
                audit: () => this.selectedAudObj = item,
                teacher: () => this.selectedTeacherObj = item
            };
            
            selectors[this.modalType]?.();
            this.showSelector = false;
        },

        async handleCourseChange() {
            this.resetSelections();
            this.showSelector = false;
        },

        async handleSemesterChange() {
            this.resetSelections();
            this.showSelector = false;
        }

        // async handleCourseChange() {
        //     await this.loadSubjects();
        //     this.showSelector = false;
        // },

        // async handleSemesterChange() {
        //     await this.loadSubjects();
        //     this.showSelector = false;
        // }
    }
};
</script>


<style lang="scss" scoped>
.sched {
    font-size: 0.9rem;
    padding: 1rem;
}

/* Общие стили таблиц */
.table {
    border-collapse: separate;
    border-spacing: 0;
    margin: 0.5rem 0;
    
    th {
        cursor: pointer;
        transition: all 0.2s;
        font-weight: normal;
        padding: 0.75rem;
        border: 1px solid #dee2e6;
        
        &:hover {
            background-color: #f8f9fa;
        }
        
        &.table-active {
            background-color: #e9f5ff;
            font-weight: 500;
        }
    }
    
    thead th {
        font-weight: 500;
        background-color: #f8f9fa;
        border-bottom: 2px solid #446334;
    }
}

.table-hover {
    tbody tr {
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:hover {
            background-color: #f8f9fa;
        }
    }
    
    .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
    }
}


/* Стили форм и селектов */
.form-select {
    border-color: #ced4da;
    &:focus {
        border-color: #446334;
        box-shadow: 0 0 0 0.2rem rgba(68, 99, 52, 0.25);
    }
}

.form-check-input {
    &:checked {
        background-color: #446334;
        border-color: #446334;
    }
}

/* Основные кнопки */
.btn-primary {
    background-color: #446334;
    border-color: #446334;
    transition: all 0.2s;
    
    &:hover {
        background-color: #365027;
        border-color: #2d441f;
        transform: translateY(-1px);
    }
    
    &:active {
        transform: translateY(0);
    }
}

.bg-success{
    background-color: #446334 !important;
}

.btn-close {
    opacity: 0.8;
    transition: opacity 0.2s;
    
    &:hover {
        opacity: 1;
    }
}

/* Стили карточек выбора */
.card {
    border-color: #446334;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
    
    .card-header {
        background-color: #446334;
        color: white;
        font-weight: 500;
        padding: 0.75rem 1rem;
    }
    
    .card-body {
        padding: 1rem;
        background-color: #f8f9fa;
    }
}

/* Кнопки в модальном окне */
.btn-outline-success {
    color: #446334;
    border-color: #446334;
    margin: 0.25rem;
    transition: all 0.2s;
    
    &:hover {
        background-color: #446334;
        color: white;
        transform: translateY(-1px);
    }
    
    &:active {
        transform: translateY(0);
    }
}

/* Уведомления */
.alert {
    position: fixed;
    bottom: 20px;
    right: 20px;
    min-width: 300px;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border: none;
    
    &.alert-success {
        background-color: #d4edda;
        color: #155724;
    }
    
    &.alert-warning {
        background-color: #fff3cd;
        color: #856404;
    }
    
    &.alert-danger {
        background-color: #f8d7da;
        color: #721c24;
    }
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Вспомогательные стили */
.text-muted {
    color: #6c757d !important;
}

.border-success {
    border-color: #446334 !important;
}

.bg-white {
    background-color: white !important;
}

.rounded {
    border-radius: 0.5rem !important;
}

.gap-2 {
    gap: 0.5rem;
}

.mb-3 {
    margin-bottom: 1rem !important;
}

.relbtn {
    left: 300px  !important;
    bottom: 12px !important;
}

/* Стили для модального окна */
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #a8a8a83b;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
}

.modal-body {
  padding: 20px;
}

.workload-table {
  width: 100%;
  border-collapse: collapse;
}

.workload-table th, .workload-table td {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.workload-table th {
  background-color: #f5f5f5;
  font-weight: 500;
}

.no-data {
  text-align: center;
  color: #999;
}

.total-row {
  font-weight: bold;
  background-color: rgba(68, 99, 52, 0.1);
}

</style>