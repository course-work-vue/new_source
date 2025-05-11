<template>
    <div class="sched col align-self-end">
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
            <div class="col-3">
                <table class="table w-100" v-if="filteredDisciples.length && showSubjects">
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
            <div class="col-7">
                <div class="border border-success rounded bg-white p-3">
                    <h3>Дисциплина: <b>{{ selectedSubjectObj.disciple_name || 'Не выбрана' }}</b></h3>
                    
                    <div class="mb-3">
                        <span class="me-2">Направление:</span>
                        <b>{{ selectedDir.dir_name || 'Не выбрано' }}</b>
                    </div>

                    <div class="mb-3">
                        <span class="me-2">Кол-во часов:</span>
                        <b>
                            {{
                                selectedSubjectObj?.lab_hours === 0 
                                ? selectedSubjectObj?.practice_hours 
                                : selectedSubjectObj?.lab_hours 
                                || 'Не выбрано'
                            }}
                        </b>
                    </div>
                    <!-- <div class="mb-3">
                        <span class="me-2">Кол-во часов:</span>
                        <b>{{ selectedSubjectObj?.hours || 'Не выбрано' }}</b>
                    </div> -->

                    <div class="d-flex align-items-center mb-3 gap-2">
                        <button 
                            class="btn btn-primary"
                            @click="openSelector('group', 'Выбрать группу', groupList)"
                            :disabled="!selectedSubjectObj.subject_id"
                            >
                            Группа: {{ selectedGroupObj.group_number || 'Не выбрана' }}
                        </button>
                        <span>Контингент: <b>{{ selectedGroupObj.students_count || 0 }}</b></span>
                    </div>

                    <!-- <div class="mb-3">
                        <span>Тип занятия: <b>{{ getSubjectType() || 'Не указан' }}</b></span>
                    </div> -->

                    <div class="d-flex gap-2 mb-3">
                        <!-- <button 
                            class="btn btn-primary"
                            @click="openSelector('audit', 'Тип аудитории', audTypes)"
                            :disabled="!selectedSubjectObj.id"
                        >
                            Аудитория: {{ selectedAudObj.value || 'Не выбрана' }}
                        </button> -->
                        
                        <button 
                            class="btn btn-primary"
                            @click="openSelector('teacher', 'Преподаватель', teachers)"
                            :disabled="!selectedSubjectObj.subject_id"
                            >
                            Преподаватель: {{ selectedTeacherObj.last_name || 'Не выбран' }}
                            <!-- <span v-if="teachers.length === 0">(Нет доступных преподавателей)</span> -->
                        </button>
                    </div>

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
                <div class="mt-3">
                    <button 
                        class="btn btn-primary btn-block"
                        @click="saveRel"
                        :disabled="!isFormValid"
                    >
                        Сохранить связь
                    </button>
                </div>
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

        <div class="input-group mb-3">
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
        </div>
        <!-- <div v-for="i in i_disciples">
            {{ i }}
        </div> -->
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
            selectedTeacherObj: {},
            subjects: [],
            groups: [],
            teachers: [],
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
            i_disciples: [],
            rowData: []
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
        
        notificationClass() {
            return {
                'alert-success': this.notifyType === 'success',
                'alert-warning': this.notifyType === 'warning',
                'alert-danger': this.notifyType === 'error'
            };
        },
        isFormValid() {
            return this.selectedGroupObj?.group_id 
                && this.selectedTeacherObj?.teacher_id;
        },

        absoluteSemester() {
            return (this.selectedCourse - 1) * 2 + this.selectedSem;
        },

        filteredSubjects() {
            if (!this.selectedProgram?.id || !this.subjectsList?.length) return [];
            
            return this.subjectsList.filter(subject => 
                subject.program_id === this.selectedProgram.id &&
                subject.sub_type !== 'Лекционное занятие' &&
                subject.semester === this.absoluteSemester
            );
        },

        selectedProgram() {
            if (!this.selectedDir?.dir_code || !this.programs?.length) return null;
            return this.programs.find(p => p.code === this.selectedDir.dir_code);
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
            if (!this.i_disciples?.length || 
                !this.selectedDir?.dir_code || 
                !this.programs?.length) return [];

            const program = this.programs.find(p => p.code === this.selectedDir.dir_code);
            if (!program) return [];

            return this.i_disciples.filter(d => 
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
                // this.loadGroups();
            }
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
        console.log(this.groupList);
        
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


        resetSelections() {
    // Сбрасываем только связанные с предметом данные
            this.selectedSubjectObj = {};
            this.selectedGroupObj = {};
            this.selectedAudObj = {};
            this.selectedTeacherObj = {};
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
        
        // async loadInitialData() {
        //     if (this.selectedDir.dir_id) {
                
        //         await this.loadDisciples();
        //         await this.loadSubjects();
        //         await this.loadGroups();
        //         this.showSubjects = true;
        //         // console.log(`был тут 2`);
        //     }
        // },   
        
        async loadInitialData() {
            if (this.selectedDir.dir_code) {
                // await this.loadGroups();
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


        // async loadInitialData() {
        //     if (this.selectedDir.dir_code) {
        //         await this.loadSubjects();
        //         await this.loadGroups();
        //     }
        // },

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

        // async loadGroups() {
        //     try {
        //         if (Array.isArray(this.groupList)) {
        //             this.rowData.value = this.groupList
        //                 .filter((group) => group.deleted_at === null)
        //                 .sort((a, b) => a.group_number.localeCompare(b.group_number));
        //         } else {
        //             if (this.groupList.deleted_at === null) {
        //                 this.rowData.value = [this.groupList];
        //             } else {
        //                 this.rowData.value = [];
        //             }
        //         }
        //         // console.log(this.rowData.value);

        //         this.groups = this.rowData.value;
                
        //         this.loading = false;
        //     } catch (error) {
        //         console.error("Error loading groups data:", error);
        //     }
        // },

        // async loadGroups() {
        //     try {
        //         if (!this.selectedDir?.dir_code) return;
                
        //         const response = await UserService.getAllGroups();
                
        //         console.log(response.data);

        //         this.groups = response.data.filter(g => 
        //             g.group_dir_id === this.selectedDir.dir_id &&
        //             g.course === this.selectedCourse
        //         );

                

        //         await Promise.all(this.groups.map(async g => {
        //             const res = await UserService.getStudentsCount(g.group_id);
        //             g.students_count = res.data[0]?.count || 0;
        //         }));

        //     } catch (error) {
        //         console.error('Error loading groups:', error);
        //     }
        // },


        // async loadGroups() {
        //     if (!this.selectedDir.dir_id) return;
            
        //     try {
        //         const response = await UserService.getAllGroups();
        //         this.groups = response.data
        //             .filter(g => g.course === this.selectedCourse && g.group_dir_id === this.selectedDir.dir_id);

        //         await Promise.all(this.groups.map(async g => {
        //             const res = await UserService.getStudentsCount(g.group_id);
        //             g.students_count = res.data[0]?.count || 0;
        //         }));
        //     } catch (error) {
        //         console.error('Error loading groups:', error);
        //     }
        // },

        async saveRel() {
            try {
                const payload = {
                    group_id: this.selectedGroupObj.group_id,
                    subject_id: this.selectedSubjectObj.subject_id, // Используем subject_id
                    teacher_id: this.selectedTeacherObj.teacher_id
                };

                await UserService.addWorkload(payload);
                this.showNotification('Связь успешно сохранена', 'success');
                this.resetDependentSelections();
                
            } catch (error) {
                console.error('Ошибка сохранения:', error);
                this.showNotification('Ошибка сохранения', 'error');
            }
        },

        resetDependentSelections() {
            this.selectedGroupObj = {};
            this.selectedTeacherObj = {};
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


        async findWorkload(groupId, subjectId) {
            try {
                const response = await UserService.getWorkloads();
                const workload = response.data.find(w => 
                    w.group_id === groupId && 
                    w.subject_id === subjectId
                );
                return workload ? workload.teacher_id : -1;
            } catch (error) {
                console.error('Ошибка поиска нагрузки:', error);
                return -1;
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

        async loadTeachers() {
            try {
                // Получаем всех преподавателей
                const teachersResponse = await UserService.getAllTeachers();
                const allTeachers = teachersResponse.data;

                // Фильтруем связи tgz по выбранной дисциплине
                const teacherIds = this.tgz
                    .filter(t => t.disciple_id === this.selectedSubjectObj.id)
                    .map(t => t.teacher_id);

                // Убираем дубликаты и фильтруем преподавателей
                this.teachers = allTeachers.filter(t => 
                    [...new Set(teacherIds)].includes(t.teacher_id)
                );

            } catch (error) {
                console.error('Error loading teachers:', error);
                this.teachers = [];
            }
        },


        openSelector(type, title, items) {
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
</style>