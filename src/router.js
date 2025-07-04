import { createWebHashHistory, createRouter } from "vue-router";
import Home from "./components/Home.vue";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
import jwt_decode from "jwt-decode";
import AuthService from "./services/auth.service";
import AppLayout from "./layout/AppLayout.vue";
import { useAuthStore } from "./store2/auth";

// lazy-loaded
const Profile = () => import("./components/Profile.vue");

const BoardUser = () => import("./components/BoardUser.vue");

const StudentList = () => import("./components/student/StudentList.vue");

const RightsTable = () => import("./components/RightsTable.vue");
const DirectionList = () => import("./components/student/DirectionList.vue");

const ProfileList = () => import("./components/student/ProfileList.vue");

const GroupList = () => import("./components/student/GroupList.vue");

const CWList = () => import("./components/student/CwList.vue");

// Импорты слушателей

const ListenerList = () => import("./components/listener/ListenerList.vue");
const PayerList = () => import("./components/listener/PayerList.vue");
const lGroupList = () => import("./components/listener/ListenergroupList.vue");
const ContractList = () => import("./components/listener/ContractList.vue");
const ProgramList = () => import("./components/listener/ProgramList.vue");
const PaymentList = () => import("./components/listener/PaymentList.vue");

// Конец импортов слушателей

const ScheduleLoads = () => import("./components/ScheduleLoads.vue");

const AddCourse = () => import("./components/AddCourse.vue");
const CourseList = () => import("./components/CourseList.vue");
const CourseDetail = () => import("./components/CourseDetail.vue");

//Расписание

const AuditList = () => import("./components/AuditList.vue");
const ScheduleList = () => import("./components/ScheduleList.vue");

const addLgroup = () => import("./components/AddListenergroup.vue");

//ЖУРНАЛ
const TeacherList = () => import("./components/TeacherList.vue");
const AddTeacher = () => import("./components/AddTeacher.vue");
const TeacherDetail = () => import("./components/TeacherDetail.vue");

const TegrsuList = () => import("./components/TegrsuList.vue");
const AddTegrsu = () => import("./components/AddTegrsu.vue");
const TegrsuDetail = () => import("./components/TegrsuDetail.vue");

const JournalList = () => import("./components/JournalList.vue");
//ЖУРНАЛ
//ЖУРНАЛНОВЫЙ
const TeacherListNew = () => import("./components/newjournal/TeacherListNew.vue")
const JournalListNew = () => import("./components/newjournal/JournalListNew.vue")
const TegrsuListNew = () => import("./components/newjournal/TegrsuListNew.vue")
//ЖУРНАЛНОВЫЙ
const ImportList = () => import("./components/import/ImportList.vue");

const RoleList = () => import("./components/admin/RoleList.vue");
const ProcedureList = () => import("./components/admin/ProcedureList.vue");
const FunctionList = () => import("./components/admin/FunctionList.vue");
const TriggerList = () => import("./components/admin/TriggerList.vue");
const TableList = () => import("./components/admin/TableList.vue");
const UserList = () => import("./components/admin/UserList.vue");
const SchemaList = () => import("./components/admin/SchemaList.vue");
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
        path: "/students",
        name: "Студенты",
        component: StudentList,
        meta: { roles: ["super_admin", "superadmin", "control_student"] },
      },

      //{ path: '/students/:studentId', component: StudentDetail },
      { path: "/rights/:table", component: RightsTable },
      {
        path: "/directions",
        name: "Направления",
        component: DirectionList,
        meta: { roles: ["super_admin", "superadmin", "control_student"] },
      },
      {
        path: "/groups",
        name: "Группы",
        component: GroupList,
        meta: { roles: ["super_admin", "superadmin", "control_student"] },
      },
      //{ path: '/directions/:directionId', component: DirectionDetail },

      {
        path: "/profiles",
        name: "Профили",
        component: ProfileList,
        meta: { roles: ["super_admin", "superadmin", "control_student"] },
      },
      // { path: '/profiles/:profileId', component: ProfileDetail },

      // { path: '/groups/:groupId', component: GroupDetail },

      { path: "/courses", name: "Курсы", component: CourseList },
      { path: "/courses/:courseID", component: CourseDetail },
      { path: "/AddCourse", component: AddCourse },

      // КОНЕЦ КОМПОНЕНТОВ СТУДЕНТОВ
      // КОМПОНЕНТЫ ДЛЯ СЛУШАТЕЛЕЙ

      {
        path: "/listeners",
        name: "Слушатели",
        component: ListenerList,
        meta: { roles: ["super_admin", "superadmin", "control_listener"] },
      },
      {
        path: "/payers",
        name: "Плательщики",
        component: PayerList,
        meta: { roles: ["super_admin", "superadmin", "control_listener"] },
      },
      {
        path: "/lgroups",
        name: "Группы слушателей",
        component: lGroupList,
        meta: { roles: ["super_admin", "superadmin", "control_listener"] },
      },
      {
        path: "/addlgroup",
        name: "Добавить группу",
        component: addLgroup,
        meta: { roles: ["super_admin", "superadmin", "control_listener"] },
      },
      {
        path: "/contracts",
        name: "Договоры",
        component: ContractList,
        meta: { roles: ["super_admin", "superadmin", "control_listener"] },
      },
      {
        path: "/programs",
        name: "Программы",
        component: ProgramList,
        meta: { roles: ["super_admin", "superadmin", "control_listener"] },
      },
      {
        path: "/payments",
        name: "Платежи",
        component: PaymentList,
        meta: { roles: ["super_admin", "superadmin", "control_listener"] },
      },

      // КОНЕЦ КОМПОНЕНТОВ ДЛЯ СЛУШАТЕЛЕЙ

      { path: "/ScheduleLoads", component: ScheduleLoads },

      //{ path: '/addcw', component: AddCw },
      {
        path: "/courseworks",
        component: CWList,
        meta: { roles: ["super_admin", "superadmin", "control_student"] },
      },
      // { path: '/courseworks/:CwId', component: CWdetail },

      { path: "/programs", component: ProgramList },

      //Расписание
      { path: "/audits", component: AuditList },
      { path: "/schedules", component: ScheduleList },

      //ЖУРНАЛ
      { path: "/teachers", component: TeacherList },
      { path: "/teachers/:teacherId", component: TeacherDetail },
      { path: "/AddTeacher", component: AddTeacher },

      { path: "/tegrsus", component: TegrsuList },
      { path: "/tegrsus/:tegrsuId", component: TegrsuDetail },
      { path: "/AddTegrsu", component: AddTegrsu },

      { path: "/journals", component: JournalList },
      //ЖУРНАЛ
      //НОВЫЙЖУРНАЛ
      { path: '/teacherListNew', component: TeacherListNew },
      
      {
        path: '/TeacherGroupsSubjects/:teacher_id/',
        name: 'TeacherGroupsSubjects',
        component: TegrsuListNew,
        props: true
      },
      
      {
        path: '/journal/:wl_id',
        name: 'JournalListNew',
        component: JournalListNew,
        props: true
      },
      //
      { path: "/lgroups", component: lGroupList },
      {
        path: "/user",
        name: "user",
        // lazy-loaded
        component: BoardUser,
      },

      {
        path: "/procedures",
        name: "Процедуры",
        component: ProcedureList,
        meta: { roles: ["super_admin", "superadmin"] },
      },
      {
        path: "/functions",
        name: "Функции",
        component: FunctionList,
        meta: { roles: ["super_admin", "superadmin"] },
      },
      {
        path: "/triggers",
        name: "Триггеры",
        component: TriggerList,
        meta: { roles: ["super_admin", "superadmin"] },
      },
      {
        path: "/tables",
        name: "Таблицы",
        component: TableList,
        meta: { roles: ["super_admin", "superadmin"] },
      },
      {
        path: "/roles",
        name: "Роли",
        component: RoleList,
        meta: { roles: ["super_admin", "superadmin"] },
      },
      {
        path: "/users",
        name: "Пользователи",
        component: UserList,
        meta: { roles: ["super_admin", "superadmin"] },
      },
      {
        path: "/schemas",
        name: "схемы",
        component: SchemaList,
        meta: { roles: ["super_admin", "superadmin"] },
      },
    ],
    // { path: '/AddStudent/:groupName', component: AddStudent },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const publicPages = ["/login", "/register", "/home"];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem("user");

  if (authRequired && !loggedIn) {
    return next("/login");
  }

  if (loggedIn) {
    document.title = to.name || "Application";
    const token = JSON.parse(loggedIn).accessToken;
    let decodedToken;
    try {
      decodedToken = jwt_decode(token);
    } catch (err) {
      console.error("Ошибка декодирования токена:", err);
      return next();
    }

    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      authStore.login(); // или logout, как у вас принято
      return next("/login");
    }

    // СРАВНИВАЕМ ИМЕНА МАРШРУТОВ (игнорим query)
    const routeChanged = to.name !== from.name;
    if (routeChanged) {
      // получаем роли только при смене маршрута «по сути»
      await authStore.getRolesFromToken({ token: authStore.user.accessToken });
    }

    // если в маршруте есть meta.roles — проверяем их
    if (to.meta.roles) {
      const userRoles = authStore.user?.roles || [];
      const required = to.meta.roles;
      const hasRole = userRoles.some((r) => required.includes(r));
      if (!hasRole) {
        authStore.noAccess = true;
        // можно редиректить на /no-access или просто next()
      } else {
        authStore.noAccess = false;
      }
    } else {
      authStore.noAccess = false;
    }

    return next();
  }

  // публичные страницы
  next();
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
