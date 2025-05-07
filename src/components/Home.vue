<template>
  <div class="home-container">
    <Toast />
    <div class="grid p-2">
      <!-- Welcome section with user info -->
      <div class="col-12">
        <div class="card mb-0">
          <div class="flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">Добро пожаловать, {{ userName }}</h2>
              <p class="text-secondary mb-0">{{ getCurrentDateTime() }}</p>
            </div>
            <div v-if="userRoles && userRoles.length > 0">
              <Tag v-for="role in userRoles" :key="role" :value="formatRoleName(role)" severity="info" class="ml-1" />
            </div>
          </div>
        </div>
      </div>

      <!-- Stats overview -->
      <div class="col-12 md:col-6 xl:col-3">
        <div class="card mb-0 cursor-pointer" @click="navigateTo('/students')">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Студенты</span>
              <div class="text-900 font-medium text-xl">{{ totalStudents }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-users text-blue-500 text-xl"></i>
            </div>
          </div>
          <span class="text-green-500 font-medium">{{ activeStudents }} активных </span>
          <span class="text-500">из {{ totalStudents }} зарегистрированных</span>
        </div>
      </div>

      <div class="col-12 md:col-6 xl:col-3">
        <div class="card mb-0 cursor-pointer" @click="navigateTo('/teachers')">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Преподаватели</span>
              <div class="text-900 font-medium text-xl">{{ totalTeachers }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-user text-cyan-500 text-xl"></i>
            </div>
          </div>
          <span class="text-500">Преподавательский состав</span>
        </div>
      </div>

      <div class="col-12 md:col-6 xl:col-3">
        <div class="card mb-0 cursor-pointer" @click="navigateTo('/groups')">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Группы</span>
              <div class="text-900 font-medium text-xl">{{ totalGroups }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-th-large text-orange-500 text-xl"></i>
            </div>
          </div>
          <span class="text-500">Учебные группы</span>
        </div>
      </div>

      <div class="col-12 md:col-6 xl:col-3">
        <div class="card mb-0 cursor-pointer" @click="navigateTo('/lgroups')">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">Слушатели</span>
              <div class="text-900 font-medium text-xl">{{ totalListeners }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-users text-purple-500 text-xl"></i>
            </div>
          </div>
          <span class="text-500">{{ listenersInGroups }} в группах</span>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="col-12 md:col-6 xl:col-8">
        <div class="card mb-0">
          <h5>Быстрые действия</h5>
          <div class="grid">
            <div v-for="item in quickActions" :key="item.label" class="col-12 md:col-6 lg:col-4">
              <Button :label="item.label" :icon="item.icon" @click="navigateTo(item.route)" 
                      :disabled="item.requiredRoles && !hasRequiredRole(item.requiredRoles)"
                      class="p-button-outlined w-full mb-2"></Button>
            </div>
          </div>
        </div>
      </div>

      <!-- User activity or notifications -->
      <div class="col-12 md:col-6 xl:col-4">
        <div class="card mb-0">
          <h5>Последние события</h5>
          <div v-if="recentActivities.length > 0">
            <Timeline :value="recentActivities" class="w-full">
              <template #content="slotProps">
                <div class="flex flex-column">
                  <small class="text-color-secondary">{{ slotProps.item.date }}</small>
                  <span class="mb-1 font-medium">{{ slotProps.item.title }}</span>
                  <p class="mb-0 text-sm">{{ slotProps.item.description }}</p>
                </div>
              </template>
              <template #opposite="slotProps">
                <div class="flex w-full justify-content-end">
                  <Tag :value="slotProps.item.category" :severity="slotProps.item.severity"></Tag>
                </div>
              </template>
            </Timeline>
          </div>
          <div v-else class="text-center p-4">
            <i class="pi pi-inbox text-xl text-color-secondary"></i>
            <p>Нет новых событий</p>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="col-12 md:col-6">
        <div class="card mb-0">
          <h5>Студенты по направлениям</h5>
          <Chart v-if="chartData.studentsPerDirection.labels.length" type="pie" :data="chartData.studentsPerDirection" :options="chartOptions" />
          <div v-else class="flex align-items-center justify-content-center" style="height:200px">
            <ProgressSpinner v-if="loading" style="width:50px;height:50px" />
            <div v-else class="text-center">
              <i class="pi pi-chart-pie text-xl text-color-secondary"></i>
              <p>Нет данных для отображения</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6">
        <div class="card mb-0">
          <h5>Активность за последние 7 дней</h5>
          <Chart v-if="chartData.weeklyActivity.labels.length" type="bar" :data="chartData.weeklyActivity" :options="chartOptions" />
          <div v-else class="flex align-items-center justify-content-center" style="height:200px">
            <ProgressSpinner v-if="loading" style="width:50px;height:50px" />
            <div v-else class="text-center">
              <i class="pi pi-chart-bar text-xl text-color-secondary"></i>
              <p>Нет данных для отображения</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStudentStore } from '@/store2/studentgroup/student';
import { useTeacherStore } from '@/store2/teachergroup/teacher';
import { useGroupStore } from '@/store2/studentgroup/group';
import { useListenerStore } from '@/store2/listenergroup/listener';
import { useListenergroupStore } from '@/store2/listenergroup/listenergroup';
import { useDirectionStore } from '@/store2/studentgroup/direction';
import { useAuthStore } from '@/store2/auth';

export default {
  name: 'Home',
  setup() {
    const router = useRouter();
    const studentStore = useStudentStore();
    const teacherStore = useTeacherStore();
    const groupStore = useGroupStore();
    const listenerStore = useListenerStore();
    const listenergroupStore = useListenergroupStore();
    const directionStore = useDirectionStore();
    const authStore = useAuthStore();

    const loading = ref(true);
    const totalStudents = ref(0);
    const activeStudents = ref(0);
    const totalTeachers = ref(0);
    const totalGroups = ref(0);
    const totalListeners = ref(0);
    const listenersInGroups = ref(0);

    const chartData = reactive({
      studentsPerDirection: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              '#42A5F5',
              '#66BB6A',
              '#FFA726',
              '#26C6DA',
              '#7E57C2',
              '#EC407A',
              '#AB47BC',
              '#5C6BC0',
              '#D4E157',
              '#FF7043'
            ]
          }
        ]
      },
      weeklyActivity: {
        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        datasets: [
          {
            label: 'Активность',
            data: [8, 15, 18, 12, 20, 5, 3],
            backgroundColor: '#42A5F5'
          }
        ]
      }
    });

    const chartOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    const quickActions = [
      { label: 'Добавить студента', icon: 'pi pi-user-plus', route: '/students', requiredRoles: ['admin', 'teacher'] },
      { label: 'Управление группами', icon: 'pi pi-th-large', route: '/groups', requiredRoles: ['admin', 'manager'] },
      { label: 'Расписание', icon: 'pi pi-calendar', route: '/schedules' },
      { label: 'Список курсов', icon: 'pi pi-book', route: '/courses' },
      { label: 'Слушатели', icon: 'pi pi-users', route: '/listeners' },
      { label: 'Договоры', icon: 'pi pi-file', route: '/contracts' }
    ];

    const recentActivities = ref([
      {
        title: 'Обновление системы',
        date: '10.05.2023',
        description: 'Внесены улучшения в интерфейс системы',
        category: 'Система',
        severity: 'info'
      },
      {
        title: 'Новые студенты',
        date: '08.05.2023',
        description: 'Добавлены 15 новых студентов',
        category: 'Студенты',
        severity: 'success'
      },
      {
        title: 'Изменение расписания',
        date: '05.05.2023',
        description: 'Внесены корректировки в расписание занятий',
        category: 'Расписание',
        severity: 'warning'
      }
    ]);

    const userName = computed(() => {
      if (authStore.user && authStore.user.username) {
        return authStore.user.username;
      }
      return 'пользователь';
    });

    const userRoles = computed(() => {
      if (authStore.user && authStore.user.roles) {
        return authStore.user.roles;
      }
      return [];
    });

    const hasRequiredRole = (requiredRoles) => {
      if (!requiredRoles || requiredRoles.length === 0) return true;
      if (!userRoles.value || userRoles.value.length === 0) return false;
      
      return userRoles.value.some(role => requiredRoles.includes(role));
    };

    const formatRoleName = (role) => {
      const roleNames = {
        'admin': 'Администратор',
        'super_admin': 'Супер админ',
        'teacher': 'Преподаватель',
        'manager': 'Менеджер',
        'student': 'Студент'
      };
      
      return roleNames[role] || role;
    };

    const navigateTo = (route) => {
      router.push(route);
    };

    const getCurrentDateTime = () => {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return now.toLocaleDateString('ru-RU', options);
    };

    const loadDataAndStats = async () => {
      loading.value = true;
      
      try {
        // Load students data
        if (studentStore.studentList.length === 0) {
          await studentStore.getStudentList();
        }
        
        totalStudents.value = studentStore.studentList.length;
        activeStudents.value = studentStore.activeSortedStudents.length;

        // Load teachers data
        if (teacherStore.teacherList.length === 0) {
          await teacherStore.getTeacherList();
        }
        totalTeachers.value = teacherStore.teacherList.length;

        // Load groups data
        if (groupStore.groupList.length === 0) {
          await groupStore.getGroupList();
        }
        totalGroups.value = groupStore.groupList.length;

        // Load listeners data
        if (listenerStore.listenerList.length === 0) {
          await listenerStore.getListenerList();
        }
        totalListeners.value = listenerStore.listenerList.length;

        // Load listener groups data
        if (listenergroupStore.listenergroupList.length === 0) {
          await listenergroupStore.getListenergroupList();
        }
        
        // Count listeners in groups
        listenersInGroups.value = listenerStore.listenerList.filter(listener => listener.group_id).length;

        // Load directions data and prepare chart
        if (directionStore.directionList.length === 0) {
          await directionStore.getDirectionList();
        }

        // Prepare students per direction chart data
        const directionsMap = new Map();
        
        // Count students per direction
        studentStore.studentList.forEach(student => {
          if (student.deleted_at === null) {
            const group = groupStore.groupList.find(g => g.group_id === student.group_id);
            if (group) {
              const directionId = group.group_dir_id;
              if (directionId) {
                directionsMap.set(directionId, (directionsMap.get(directionId) || 0) + 1);
              }
            }
          }
        });
        
        // Prepare chart data
        chartData.studentsPerDirection.labels = [];
        chartData.studentsPerDirection.datasets[0].data = [];
        
        directionsMap.forEach((count, directionId) => {
          const direction = directionStore.directionList.find(d => d.dir_id === directionId);
          if (direction) {
            chartData.studentsPerDirection.labels.push(direction.dir_name);
            chartData.studentsPerDirection.datasets[0].data.push(count);
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadDataAndStats();
    });

    return {
      loading,
      totalStudents,
      activeStudents,
      totalTeachers,
      totalGroups,
      totalListeners,
      listenersInGroups,
      chartData,
      chartOptions,
      quickActions,
      recentActivities,
      userName,
      userRoles,
      navigateTo,
      getCurrentDateTime,
      hasRequiredRole,
      formatRoleName
    };
  }
};
</script>

<style scoped>
.home-container {
  padding: 1rem;
}

.card {
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background-color: var(--surface-card);
}

.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cursor-pointer:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}
</style>
