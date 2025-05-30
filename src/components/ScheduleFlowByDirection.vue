<template>
  <div class="schedule-flow">
    <h2>Потоки (по направлениям)</h2>

    <div class="mb-3 d-flex gap-3">
      <select class="form-select w-auto" v-model="selectedProfile" @change="filterByProfile">
        <option value="">Все профили</option>
        <option v-for="prof in profileList" :key="prof.prof_id" :value="prof.prof_id">
          {{ prof.prof_name }}
        </option>
      </select>

      <select class="form-select w-auto" v-model="selectedCourse">
        <option value="">Все курсы</option>
        <option v-for="course in [1,2,3,4]" :key="course" :value="course">
          {{ course }} курс
        </option>
      </select>
    </div>

    <div class="table-responsive">
      <table class="table table-sm table-bordered">
        <thead>
            <tr><th @click="sort('direction')" class="sortable" rowspan="2">
              Направление <i class="bi" :class="getSortIcon('direction')"></i>
            </th>
            <th @click="sort('profile')" class="sortable" rowspan="2">
              Профиль <i class="bi" :class="getSortIcon('profile')"></i>
            </th>
            
            <th @click="sort('course')" class="sortable" rowspan="2">
              Курс <i class="bi" :class="getSortIcon('course')"></i>
            </th>
            <th colspan="2">Контингент</th>
            <th rowspan="2">Кол-во потоков</th>
            <th @click="sort('groupCount')" class="sortable" rowspan="2">
              Группы <i class="bi" :class="getSortIcon('groupCount')"></i>
            </th>
            <th rowspan="2">Кол-во подгрупп</th>
          </tr>
          <tr>
            <th @click="sort('budgetCount')" class="sortable">
              Бюджет <i class="bi" :class="getSortIcon('budgetCount')"></i>
            </th>
            <th @click="sort('contractCount')" class="sortable">
              Договор <i class="bi" :class="getSortIcon('contractCount')"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in sortedTableData" :key="item.id">
            <tr>
              <td :rowspan="item.groups.length || 1">{{ item.directionCode }} - {{ item.direction }}</td>
              <td :rowspan="item.groups.length || 1">{{ item.profile }}</td>
              <td :rowspan="item.groups.length || 1">{{ item.course }}</td>
              <td :rowspan="item.groups.length || 1">{{ item.budgetCount }}</td>
              <td :rowspan="item.groups.length || 1">{{ item.contractCount }}</td>
              <td :rowspan="item.groups.length || 1">
                <select v-model="item.flowCount" class="form-select form-select-sm">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </td>
              <td v-if="item.groups.length">
                <router-link :to="'/groups/' + item.groups[0].id" class="group-link">
                  {{ item.groups[0].number }}
                </router-link>
              </td>
              <td v-else>-</td>
              <td v-if="item.groups.length">{{ item.groups[0].subgroupCount }}</td>
              <td v-else>-</td>
            </tr>
            <tr v-for="group in item.groups.slice(1)" :key="group.id">
              <td>
                <router-link :to="'/groups/' + group.id" class="group-link">
                  {{ group.number }}
                </router-link>
              </td>
              <td>{{ group.subgroupCount }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { mapState, mapActions } from 'pinia';
import { useDirectionStore } from '@/store2/studentgroup/direction';
import { useProfileStore } from '@/store2/studentgroup/profile';
import { useGroupStore } from '@/store2/studentgroup/group';
import UserService from '@/services/user.service';

export default {
  name: 'ScheduleFlowByDirection',
  setup() {
    const tableData = ref([]);
    const programs = ref([]);
    const studentsList = ref([]);
    const selectedProfile = ref('');
    const selectedCourse = ref('');
    const sortConfig = ref({
      key: null,
      direction: 'asc'
    });

    return {
      tableData,
      programs,
      studentsList,
      selectedProfile,
      selectedCourse,
      sortConfig
    };
  },
  computed: {
    ...mapState(useDirectionStore, ['directionList']),
    ...mapState(useProfileStore, ['profileList']),
    ...mapState(useGroupStore, ['groupList']),
    
    filteredTableData() {
      let filtered = this.tableData;
      
      if (this.selectedProfile) {
        filtered = filtered.filter(item => {
          const profile = this.profileList.find(p => p.prof_name === item.profile);
          return profile && profile.prof_id === this.selectedProfile;
        });
      }
      
      if (this.selectedCourse) {
        filtered = filtered.filter(item => item.course === this.selectedCourse);
      }
      
      return filtered;
    },

    sortedTableData() {
      if (!this.sortConfig.key) return this.filteredTableData;

      return [...this.filteredTableData].sort((a, b) => {
        let aValue = a[this.sortConfig.key];
        let bValue = b[this.sortConfig.key];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return this.sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    },

    groupedTableData() {
      const grouped = {};
      const sorted = [...this.sortedTableData].sort((a, b) => {
        // Sort by profile first, then direction
        const profileCompare = a.profile.localeCompare(b.profile);
        if (profileCompare !== 0) return profileCompare;
        return a.direction.localeCompare(b.direction);
      });

      sorted.forEach(item => {
        const key = `${item.profile}-${item.direction}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
      });
      return grouped;
    },

    getTotalRowSpan(items) {
      return items.reduce((total, item) => total + Math.max(1, item.groups.length), 0);
    }
  },
  methods: {
    ...mapActions(useDirectionStore, ['getDirectionList']),
    ...mapActions(useProfileStore, ['getProfileList']),
    ...mapActions(useGroupStore, ['getGroupList']),

    sort(key) {
      if (this.sortConfig.key === key) {
        this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortConfig.key = key;
        this.sortConfig.direction = 'asc';
      }
    },

    getSortIcon(key) {
      if (this.sortConfig.key !== key) return 'bi-arrow-down-up';
      return this.sortConfig.direction === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
    },

    filterByProfile() {
      // Фильтрация происходит автоматически через computed свойство
    },

    calculateCourse(startYear) {
      const currentDate = new Date();
      const academicYear = currentDate.getMonth() < 7 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
      const yearDiff = academicYear - startYear;
      return Math.min(Math.max(1, yearDiff + 1), 4);
    },

    async loadPrograms() {
      try {
        const response = await UserService.getPrograms_imp();
        this.programs = response.data;
      } catch (error) {
        console.error('Error loading programs:', error);
      }
    },

    async loadStudents() {
      try {
        const response = await UserService.getAllStudents();
        this.studentsList = response.data;
      } catch (error) {
        console.error('Error loading students:', error);
      }
    },

    getSubgroupCount(groupId) {
      const students = this.studentsList.filter(s => 
        s.group_id === groupId && !s.deleted_at
      );
      return students.some(s => s.subgroup === 2) ? 2 : 1;
    },

    async loadData() {
      try {
        await this.getDirectionList();
        await this.getProfileList();
        await this.getGroupList();
        await this.loadPrograms();
        await this.loadStudents();

        const processedData = [];

        this.programs.forEach(program => {
          const profile = this.profileList.find(p => p.prof_id === program.profile_id);
          if (!profile || profile.deleted_at) return;

          const direction = this.directionList.find(d => d.dir_id === profile.prof_dir_id);
          if (!direction || direction.deleted_at) return;

          const course = this.calculateCourse(program.start_year);
          
          // Get all groups for this combination
          const relevantGroups = this.groupList
            .filter(g => 
              g.group_dir_id === direction.dir_id && 
              g.group_prof_id === profile.prof_id && 
              g.course === course
            )
            .map(group => ({
              id: group.group_id,
              number: group.group_number,
              subgroupCount: this.getSubgroupCount(group.group_id)
            }));

          // Calculate student counts
          const students = this.studentsList.filter(s => {
            if (s.deleted_at) return false;
            const group = this.groupList.find(g => g.group_id === s.group_id);
            return group && 
                   group.group_dir_id === direction.dir_id && 
                   group.group_prof_id === profile.prof_id && 
                   group.course === course;
          });

          const budgetCount = students.filter(s => s.is_budget).length;
          const contractCount = students.filter(s => !s.is_budget).length;

          processedData.push({
            id: `${direction.dir_id}-${profile.prof_id}-${course}`,
            direction: direction.dir_name,
            directionCode: direction.dir_code,
            profile: profile.prof_name,
            course: course,
            budgetCount,
            contractCount,
            flowCount: 1,
            groups: relevantGroups
          });
        });

        this.tableData = processedData;
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  },
  async mounted() {
    await this.loadData();
  }
};
</script>

<style scoped>
.schedule-flow {
  padding: 1rem;
}

.table {
  margin-top: 1rem;
  border: 1px solid #dee2e6;
}

.table th {
  text-align: center;
  vertical-align: middle;
  background-color: #446334;
  color: white;
  border: 1px solid #2f3b29;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.table td {
  vertical-align: middle;
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.table thead {
  margin-bottom: 10px;
  border-bottom: 2px solid #2f3b29;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #385429;
}

.form-select {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.bi {
  margin-left: 0.25rem;
  display: inline-block;
}

.bi-arrow-up::before {
  content: "↑";
}

.bi-arrow-down::before {
  content: "↓";
}

.bi-arrow-down-up::before {
  content: "↕";
}

[rowspan] {
  background-color: #ffffff;
}

tbody tr:hover td {
  background-color: #f8f9fa;
}

.group-link {
  color: #446334;
  text-decoration: none;
}

.group-link:hover {
  color: #385429;
  text-decoration: underline;
}
</style> 