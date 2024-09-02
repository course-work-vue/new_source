<template>
    <div class="col col-xs-9 col-lg-12 mt-4 offset-md-1">
        <div class="col col-10 align-self-end">
            <table v-if="loading" class="table">
                <tbody>
                <tr v-for="n in subjects" :key="n">
                    <td><div class="skeleton skeleton-animate"></div></td>
                    <td><div class="skeleton skeleton-animate"></div></td>
                    <td><div class="skeleton skeleton-animate"></div></td>
                    <td><div class="skeleton skeleton-animate"></div></td>
                    <td><div class="skeleton skeleton-animate"></div></td>
                    <td><div class="skeleton skeleton-animate"></div></td>
                </tr>
                </tbody>
            </table>
            <div  v-else>
                <div class="d-flex">
                    <!-- Выбор направления -->
                    <table class="table" id="table_dirs">
                        <thead>
                            <tr><th>Группа</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="group in this.groups" :key="group.group_id">
                                <th
                                    @click="this.selected_group = group.group_id; findWl(group.group_id)"
                                    v-bind:class="{ 'table-active': this.selected_group == group.group_id }"
                                >
                                    {{ dir.dir_code }}
                                </th>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Выбор предмета -->
                    <table v-if="s_loading" class="table skelet">
                        <tbody>
                            <tr></tr>
                            <tr v-for="n in subjects" :key="n">
                                <td><div class="skeleton skeleton-animate"></div></td>
                                <td><div class="skeleton skeleton-animate"></div></td>
                                <td><div class="skeleton skeleton-animate"></div></td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="table table-sm" v-else-if="this.selected_dir >= 0" id="table_subject">
                        <thead>
                            <tr><th>Предмет</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="subject in this.subjects" :key="subject.subject_id">
                                <th
                                    @click="
                                        this.selected_subject = subject.subject_id; 
                                        this.loadTeachersData(subject.subject_id);
                                        this.t_loading = true;
                                    "
                                    v-bind:class="{ 'table-active': this.selected_subject == subject.subject_id }"
                                >
                                {{ subject.subject_name }}
                                </th>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Выбор группы -->
                    <table v-if="s_loading" class="table skelet">
                        <tbody>
                            <tr></tr>
                            <tr v-for="n in subjects" :key="n">
                                <td><div class="skeleton skeleton-animate"></div></td>
                                <td><div class="skeleton skeleton-animate"></div></td>
                                <td><div class="skeleton skeleton-animate"></div></td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="table" v-else-if="this.selected_subject >= 0" id="table_group">
                        <thead>
                            <tr><th>Группа</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="group in this.groups" :key="group.group_id">
                                <th
                                    @click="this.selected_group = group.group_id; findWl(group.group_id)"
                                    v-bind:class="{ 'table-active': this.selected_group == group.group_id, 'text-success bold': this.findWl(group.group_id, this.selected_subject) != -1 }"
                                >
                                    {{ group.group_number }}
                                </th>
                            </tr>
                        </tbody>
                    </table>
                
                    
                    <!-- Выбор препода -->
                    <table v-if="t_loading" class="table skelet">
                        <tbody>
                            <tr v-for="n in subjects" :key="n">
                                <td><div class="skeleton skeleton-animate"></div></td>
                                <td><div class="skeleton skeleton-animate"></div></td>
                                <td><div class="skeleton skeleton-animate"></div></td>
                            </tr>
                        </tbody>
                    </table>
                
                    <table class="table table-sm" v-else-if="this.selected_subject >= 0" id="table_teacher">
                        <thead>
                            <tr><th>Преподаватель</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="(teacher, index) in this.teachers" :key="teacher.teacher_id">
                                <th
                                    @click="
                                        this.selected_teacher = teacher.teacher_id;
                                    "
                                    v-bind:class="{ 'table-active': this.selected_teacher == teacher.teacher_id, 'table-success': this.findWl(this.selected_group, this.selected_subject) == teacher.teacher_id}"
                                >
                                {{ teacher.last_name }}
                                {{ this.teacher_load[index].length }}/5 час
                                <!-- при length жалуется на undefined -->
                                </th>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <button class="btn btn-primary btn-block" @click="saveRel">Сохранить связь</button>
                </div>
            </div>
        </div>
    </div>
</template>
    
<script>
import UserService from "../services/user.service";

export default {
    data() {
        return {
            dirs: [],
            groups: [], // массив всех групп
            subjects: [], // массив предметов
            teachers: [], // массив преподов
            employment: [], // связь многие-ко-многим преподы/предметы
            wl: [], // конечная связь
            rels: [], // связи группа+предмет / препод
            teacher_load: [], // нагрузка на препода
            selected_dir: -1,
            selected_group: -1,
            selected_subject: -1,
            selected_teacher: -1,
            saved_num: -1,
            saved_group: 0,
            saved_subject: 0,
            saved_teacher: 0,
            saved: false,
            t_loading: true,
            s_loading: true,
            wl_loading: true,
            loading: true,
            searchQuery: ''
        };
    },
    methods: {
        // грузим данные
        async loadDirsData() {
            try {
                const response = await UserService.getAllDirections(); // Replace with your API endpoint
                this.dirs = Array.isArray(response.data) ? response.data : [response.data];
                this.loading=false;
            } catch (error) {
            console.error('Error loading groups data:', error);
            }
        },

        async loadGroupsData() {
            try {
                const response = await UserService.getAllGroups(); // Replace with your API endpoint
                this.groups = Array.isArray(response.data) ? response.data : [response.data];
                this.loading=false;
            } catch (error) {
            console.error('Error loading groups data:', error);
            }
        },
        async loadGroups(dir_id){
            try {
                const response = await UserService.getGroupByDir(dir_id); // Replace with your API endpoint
                this.groups = Array.isArray(response.data) ? response.data : [response.data];
                this.s_loading=false;
            } catch (error) {
                console.error('Error loading employments data:', error);
            }
        },
        async loadTeachersData(id) {
            try {
                const response = await UserService.getTeachersForSubject(id); // Replace with your API endpoint
                this.teachers = Array.isArray(response.data) ? response.data : [response.data];
                this.loadTeacherLoad(this.teachers);
                this.s_loading=false;
            } catch (error) {
                console.error('Error loading teachers data:', error);
            }
        },
        async loadSubjectsData() {
            try {
                const response = await UserService.getAllSubjects(); // Replace with your API endpoint
                this.subjects = Array.isArray(response.data) ? response.data : [response.data];
                this.loading=false;
            } catch (error) {
                console.error('Error loading subjects data:', error);
            }
        },
        async loadEmploymentData() {
            try {
                const response = await UserService.getAllEmployments(); // Replace with your API endpoint
                this.employment = Array.isArray(response.data) ? response.data : [response.data];
                this.loading=false;
            } catch (error) {
                console.error('Error loading employments data:', error);
            }
        },
        async loadWorkloads(){
            try {
                const response = await UserService.getAllWorkloads(); // Replace with your API endpoint
                this.wl = Array.isArray(response.data) ? response.data : [response.data];
                this.wl_loading=false;
            } catch (error) {
                console.error('Error loading employments data:', error);
            }
        },
        async loadTeacherLoad(teachers){
            try {
                var arr = [];
                for (let index = 0; index < teachers.length; index++) {
                    const element = teachers[index];
                    const response = await UserService.getSubjectsForTeacher(element.teacher_id); // Replace with your API endpoint
                    var item = Array.isArray(response.data) ? response.data : [response.data];
                    
                    item == "Пустой вывод." ? arr.push([]) : arr.push(item);
                    // console.log(item);
                }
                //console.log(arr);
                this.teacher_load = arr;
                this.loading=false;
                this.t_loading = false;
            } catch (error) {
                console.error('Error loading employments data:', error);
            }
        },
        


        saveRel(){
            if (this.findWl(this.selected_group, this.selected_subject) == -1){
                UserService.addWorkload(this.selected_group, this.selected_subject, this.selected_teacher);
            }
            else if (this.findWl(this.selected_group, this.selected_subject) != this.selected_teacher){
                UserService.editWorkload(this.findWlID(this.selected_group, this.selected_subject), this.selected_teacher);
            }
            else {
                console.log("Такая запись уже есть");
                return;
            }
            this.loadTeachersData(this.selected_subject);
            while (this.loading == true && this.wl_loading == true){
                this.findWl(this.selected_group, this.selected_subject);
            }
            this.saved = true;
        },
        


        // смотрим детали о группе
        viewGroupDetail(groupId) {
            this.$router.push(`/groups/${groupId}`);
        },

        viewRightsDetail(){
            this.$router.push(`/Rights/groups`);
        },

        contains(obj, list) {
            var x;
            for (x in list) {
                if (list[x] === obj) {
                    return true;
                }
            }
            return false;
        },

        teachersForSub(sub) {
            var ts = []
            this.employment.forEach(function(entry){
                if (sub == entry.subject_id){
                    ts.push(entry);
                }
            });
            return ts;
        },
        
        findWl(group_id, subject_id){
            var i;
            for (i in this.wl) {
                if (this.wl[i].group_id == group_id) {
                    if (this.wl[i].subject_id == subject_id) 
                        return this.wl[i].teacher_id;
                }
            }
            this.s_loading = false;
            return -1;
        },

        findWlID(group_id, subject_id){
            var i;
            for (i in this.wl) {
                if (this.wl[i].group_id == group_id) {
                    if (this.wl[i].subject_id == subject_id) 
                        return this.wl[i].wl_id;
                }
            }
            this.s_loading = false;
            return -1;
        },

        loadData(){
            this.loadDirsData();
            this.loadGroupsData();
            this.loadSubjectsData();
            this.loadEmploymentData();
            this.loadWorkloads();
        }
    },
    created() {
        const query = this.$route.query;
        this.currentPage = parseInt(query.page) || 1;
        this.searchQuery = query.search || '';
        this.loadData();
    }
};
</script>

<style lang="scss" scoped>
.skeleton {
    width: 100%;
    height: 1.2em;
    background-image: linear-gradient(125deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeletonShimmer 3.5s infinite linear;
    border-radius: 4px;
    margin: 0.2em 0;
}

@keyframes skeletonShimmer {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

@keyframes skeletonFade {
    0%, 100% {
        opacity: 0.5;
    }
    50% {
        opacity: 1;
    }

}

@media (max-width: 769px) {
    .list{
        padding-left: 100px;
        font-size: 10px;
        max-width: 1100px;
    }
}

@media (max-width: 1023px) {
    .list{
        padding-left: 100px;
        font-size: 13px;

    }
}

@media (min-width: 1023px) {
    .list{
    padding-left: 100px;
    padding-right: 5px;

    }
}

.ml-240px{
    margin-left: 240px;
}

.nmbr{
    height: 44px;
}

.btn-primary{
    --bs-btn-bg: rgb(68,99,52);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
    --bs-btn-active-bg: rgb(68,99,52);
    --bs-btn-disabled-bg: rgb(68,99,52);
    display: flex;
    justify-content: center;
    align-items: center;
}
.form-control:focus {
    border-color: rgba(1, 20, 8, 0.815);
    box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
}
.form-select:focus {
    border-color: rgba(1, 20, 8, 0.815);
    box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
}
.page-link{
    height: 40px;
    width: 40px;
    margin: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.active{
    .page-link{
        background-color: rgb(68,99,52);
        border: none;
        --bs-btn-hover-bg:rgb(6 215 29);
        --bs-btn-hover-border-color: rgb(6 215 29);

    }
}
.disabled{
    .page-link{
        background-color: rgb(57, 79, 46);
        border: none;
        --bs-btn-hover-bg:rgb(6 215 29);
        --bs-btn-hover-border-color: rgb(6 215 29);
    }
}
tbody th{
    font-weight: normal;
}

table{
    margin: 2%;
    height: fit-content;
}

#table_dirs{
    width: 20%;
}

#table_group{
    width: 15%;
}
#table_subject{
    width: 35%;
}
#table_teacher{
    width: 35%;
}

.bold{
    font-weight: bold !important;
}

.skelet{
    width: 25%;
}
</style>