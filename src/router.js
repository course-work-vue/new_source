import { createWebHashHistory, createRouter } from "vue-router";
import Home from "./components/Home.vue";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
import jwt_decode from "jwt-decode";
import AuthService from './services/auth.service';
import AppLayout from './layout/AppLayout.vue'



// lazy-loaded
const Profile = () => import("./components/Profile.vue")

const BoardUser = () => import("./components/BoardUser.vue")

const StudentList = () => import("./components/student/StudentList.vue")

const RightsTable = () => import("./components/RightsTable.vue")
const DirectionList = () => import("./components/student/DirectionList.vue")

const ProfileList = () => import("./components/student/ProfileList.vue")


const GroupList = () => import("./components/student/GroupList.vue")

const CWList = () => import("./components/student/CwList.vue")


// Импорты слушателей

const ListenerList = () => import("./components/listener/ListenerList.vue")
const PayerList = () => import("./components/listener/PayerList.vue")
const lGroupList = () => import("./components/listener/ListenergroupList.vue")
const ContractList = () => import("./components/listener/ContractList.vue")
const ProgramList = () => import("./components/listener/ProgramList.vue")
const PaymentList = () => import("./components/listener/PaymentList.vue")

// Конец импортов слушателей

const ScheduleLoads = () => import("./components/ScheduleLoads.vue")

const AddCourse = () => import("./components/AddCourse.vue")
const CourseList = () => import("./components/CourseList.vue")
const CourseDetail = () => import("./components/CourseDetail.vue")


//Расписание

const AuditList = () => import("./components/AuditList.vue")
const ScheduleList = () => import("./components/ScheduleList.vue")

const addLgroup = () => import("./components/AddListenergroup.vue")


//ЖУРНАЛ
const TeacherList = () => import("./components/TeacherList.vue")
const AddTeacher = () => import("./components/AddTeacher.vue")
const TeacherDetail = () => import("./components/TeacherDetail.vue")


const TegrsuList = () => import("./components/TegrsuList.vue")
const AddTegrsu = () => import("./components/AddTegrsu.vue")
const TegrsuDetail = () => import("./components/TegrsuDetail.vue")

const JournalList = () => import("./components/JournalList.vue")
//ЖУРНАЛ

const ImportList = () => import("./components/import/ImportList.vue")


const RoleList = () => import("./components/admin/RoleList.vue")
const ProcedureList = () => import("./components/admin/ProcedureList.vue")
const FunctionList = () => import("./components/admin/FunctionList.vue")
const TriggerList = () => import("./components/admin/TriggerList.vue")
const TableList = () => import("./components/admin/TableList.vue")
const UserList = () => import("./components/admin/UserList.vue")
const routes = [

  {
    path: "/",
    name: "home",
    component: AppLayout,
    children: [
      {
        path: "/home",
        component: Home,
      },
      {
        path: "/login",
        component: Login,
      },
      {
        path: "/register",
        component: Register,
      },
      {
        path: "/profile",
        name: "profile",
        // lazy-loaded
        component: Profile,
      },
      {
        path: "/import",
        name: "Импорт данных",
        component: ImportList,
      },

      // КОМПОНЕНТЫ СТУДЕНТОВ

      {
        path: '/students',
        name: "Студенты",
        component: StudentList
      },

      //{ path: '/students/:studentId', component: StudentDetail },
      { path: '/rights/:table', component: RightsTable },
      { path: '/directions', name: "Направления", component: DirectionList },
      {
        path: '/groups',
        name: "Группы",
        component: GroupList
      },
      //{ path: '/directions/:directionId', component: DirectionDetail },

      { path: '/profiles', name: "Профили", component: ProfileList },
      // { path: '/profiles/:profileId', component: ProfileDetail },



      // { path: '/groups/:groupId', component: GroupDetail },


      { path: '/courses', name: "Курсы", component: CourseList },
      { path: '/courses/:courseID', component: CourseDetail },
      { path: '/AddCourse', component: AddCourse },

      // КОНЕЦ КОМПОНЕНТОВ СТУДЕНТОВ
      // КОМПОНЕНТЫ ДЛЯ СЛУШАТЕЛЕЙ

      {
        path: '/listeners',
        name: "Слушатели",
        component: ListenerList
      },
      {
        path: '/payers',
        name: "Плательщики",
        component: PayerList
      },
      {
        path: '/lgroups',
        name: "Группы слушателей",
        component: lGroupList
      },
      {
        path: '/addlgroup',
        name: "Добавить группу",
        component: addLgroup
      },
      {
        path: '/contracts',
        name: "Договоры",
        component: ContractList
      },
      {
        path: '/programs',
        name: "Программы",
        component: ProgramList
      },
      {
        path: '/payments',
        name: "Платежи",
        component: PaymentList
      },

      // КОНЕЦ КОМПОНЕНТОВ ДЛЯ СЛУШАТЕЛЕЙ

      { path: '/ScheduleLoads', component: ScheduleLoads },

      //{ path: '/addcw', component: AddCw },
      { path: '/courseworks', component: CWList },
      // { path: '/courseworks/:CwId', component: CWdetail },

      { path: '/programs', component: ProgramList },

      //Расписание
      { path: '/audits', component: AuditList },
      { path: '/schedules', component: ScheduleList },

      //ЖУРНАЛ
      { path: '/teachers', component: TeacherList },
      { path: '/teachers/:teacherId', component: TeacherDetail },
      { path: '/AddTeacher', component: AddTeacher },

      { path: '/tegrsus', component: TegrsuList },
      { path: '/tegrsus/:tegrsuId', component: TegrsuDetail },
      { path: '/AddTegrsu', component: AddTegrsu },

      { path: '/journals', component: JournalList },
      //ЖУРНАЛ


      { path: '/lgroups', component: lGroupList },
      {
        path: "/user",
        name: "user",
        // lazy-loaded
        component: BoardUser,
      },

      { path: '/procedures', name: "Процедуры", component: ProcedureList, meta: { roles: ["super_admin", 'superadmin'] }, },
      { path: '/functions', name: "Функции", component: FunctionList, meta: { roles: ["super_admin", 'superadmin'] }, },
      { path: '/triggers', name: "Триггеры", component: TriggerList, meta: { roles: ["super_admin", 'superadmin'] }, },
      { path: '/tables', name: "Таблицы", component: TableList, meta: { roles: ["super_admin", 'superadmin'] }, },
      { path: '/roles', name: "Роли", component: RoleList, meta: { roles: ["super_admin", 'superadmin'] }, },
      { path: '/users', name: "Пользователи", component: UserList, meta: { roles: ["super_admin", 'superadmin'] }, },
    ]
    // { path: '/AddStudent/:groupName', component: AddStudent },
  },

];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

import { useAuthStore } from "./store2/auth";

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const publicPages = ["/login", "/register", "/home"];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem("user");

  if (authRequired && !loggedIn) {
    next("/login");
  } else if (loggedIn) {
    const token = JSON.parse(loggedIn).accessToken;
    document.title = to.name || "Application";
    try {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // Если токен просрочен, выполняем логаут и переходим на страницу логина
        authStore.login();
        next("/login");
      } else {
        // Если для маршрута определены требуемые роли, выполняем проверку
        if (to.meta && to.meta.roles) {
          // Получаем роли пользователя из authStore (убедитесь, что они сохраняются после логина)
          const userRoles = authStore.user?.roles || [];
          const requiredRoles = to.meta.roles;
          const hasRole = userRoles.some((role) => requiredRoles.includes(role));
          if (!hasRole) {
            // Если роль не соответствует, устанавливаем флаг noAccess и (при желании) можно перенаправить на страницу "Нет доступа"
            authStore.noAccess = true;
            // Можно сделать редирект, например, next("/no-access");
            next();
            return;
          } else {
            // Если роль соответствует, сбрасываем флаг noAccess
            authStore.noAccess = false;
          }
        }
        authStore.noAccess = false;
        next(); // Продолжаем переход
      }
    } catch (error) {
      console.error("Ошибка декодирования токена:", error);
      next();
    }
  } else {
    next(); // Для публичных маршрутов
  }
});

/*
на случай если мы не хотим проверять токен
router.beforeEach(async (to, from, next) => {
  await store.dispatch('auth/checkTokenExpiration'); // Check token expiration

  const publicPages = ['/login', '/register', '/home'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');
  
  if (authRequired && !loggedIn) {
    next('/login'); // Redirect to login page if not logged in
  } else {
    next(); // Continue to the intended route
  }
});
*/

export default router;
