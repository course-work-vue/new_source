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
const StudentDetail = () => import("./components/StudentDetail.vue")
const AddStudent = () => import("./components/AddStudent.vue")
const RightsTable = () => import("./components/RightsTable.vue")
const DirectionList = () => import("./components/DirectionList.vue")
const AddDirection = () => import("./components/AddDirection.vue")
const DirectionDetail = () => import("./components/DirectionDetail.vue")
const ProfileList = () => import("./components/ProfileList.vue")
const AddProfile = () => import("./components/AddProfile.vue")
const ProfileDetail = () => import("./components/ProfileDetail.vue")

const GroupList = () => import("./components/GroupList.vue")
const AddGroup = () => import("./components/AddGroup.vue")
const GroupDetail = () => import("./components/GroupDetail.vue")

const ListenerList = () => import("./components/ListenerList.vue")
const ListenerDetail = () => import("./components/ListenerDetail.vue")
const AddListener = () => import("./components/AddListener.vue")

const PayerList = () => import("./components/PayerList.vue")
const PayerDetail = () => import("./components/PayerDetail.vue")
const AddPayer = () => import("./components/AddPayer.vue")

const ContractList = () => import("./components/ContractList.vue")
const ContractDetail = () => import("./components/ContractDetail.vue")
const AddContract = () => import("./components/AddContract.vue")

const ScheduleLoads = () => import("./components/ScheduleLoads.vue")

const AddCw = () => import("./components/AddCw.vue")
const CWList = () => import("./components/CwList.vue")
const CWdetail = () => import("./components/CwDetail.vue")

const ProgramList = () => import("./components/ProgramList.vue")
const AddProgram = () => import("./components/AddProgram.vue")
const ProgramDetail = () => import("./components/ProgramDetail.vue")

const AddPayment = () => import("./components/AddPayment.vue")
const PaymentList = () => import("./components/PaymentList.vue")
const PaymentDetail = () => import("./components/PaymentDetail.vue")

const AddCourse = () => import("./components/AddCourse.vue")
const CourseList = () => import("./components/CourseList.vue")
const CourseDetail = () => import("./components/CourseDetail.vue")


const AuditList = () => import("./components/AuditList.vue")
const AuditDetail = () => import("./components/AuditDetail.vue")
const AddAudit = () => import("./components/AddAudit.vue")

const addLgroup = () => import("./components/AddListenergroup.vue")
const lGroupList = () => import("./components/ListenergroupList.vue")
const lGroupDetail = () => import("./components/LgroupDetail.vue")


const xlparse = () => import("./components/xlparse.vue")
const ManageExcel = () => import("./components/ManageExcel.vue")
const ManageExcel2 = () => import("./components/ManageExcel2.vue")
const ManageExcel3 = () => import("./components/ManageExcel3.vue")
const ManageExcel4 = () => import("./components/ManageExcel4.vue")
const ManageExcel5 = () => import("./components/ManageExcel5.vue")
const ManageExcel6 = () => import("./components/ManageExcel6.vue")
const ManageExcel7 = () => import("./components/ManageExcel7.vue")
const ManageExcel8 = () => import("./components/ManageExcel8.vue")
const ManageExcel9 = () => import("./components/ManageExcel9.vue")
const ManageExcel10 = () => import("./components/ManageExcel10.vue")
const ManageExcel11 = () => import("./components/ManageExcel11.vue")
const ManageExcel12 = () => import("./components/ManageExcel12.vue")
const ManageExcel13 = () => import("./components/ManageExcel13.vue")


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
        path: "/xlparse",
        name: "xlparse",
        // lazy-loaded
        component: xlparse,
      },
      {
        path: "/ManageExcel",
        name: "ManageExcel",
        // lazy-loaded
        component: ManageExcel,
      },
      {
        path: "/ManageExcel2",
        name: "ManageExcel2",
        // lazy-loaded
        component: ManageExcel2,
      },
      {
        path: "/ManageExcel3",
        name: "ManageExcel3",
        // lazy-loaded
        component: ManageExcel3,
      },
      {
        path: "/ManageExcel4",
        name: "ManageExcel4",
        // lazy-loaded
        component: ManageExcel4,
      },
      {
        path: "/ManageExcel5",
        name: "ManageExcel5",
        // lazy-loaded
        component: ManageExcel5,
      },
      {
        path: "/ManageExcel6",
        name: "ManageExcel6",
        // lazy-loaded
        component: ManageExcel6,
      },
      {
        path: "/ManageExcel7",
        name: "ManageExcel7",
        // lazy-loaded
        component: ManageExcel7,
      },
      {
        path: "/ManageExcel8",
        name: "ManageExcel8",
        // lazy-loaded
        component: ManageExcel8,
      },
      {
        path: "/ManageExcel9",
        name: "ManageExcel9",
        // lazy-loaded
        component: ManageExcel9,
      },
      {
        path: "/ManageExcel10",
        name: "ManageExcel10",
        // lazy-loaded
        component: ManageExcel10,
      },
      {
        path: "/ManageExcel11",
        name: "ManageExcel11",
        // lazy-loaded
        component: ManageExcel11,
      },
      {
        path: "/ManageExcel12",
        name: "ManageExcel12",
        // lazy-loaded
        component: ManageExcel12,
      },
      {
        path: "/ManageExcel13",
        name: "ManageExcel13",
        // lazy-loaded
        component: ManageExcel13,
      },
      { path: '/students', component: StudentList },

      { path: '/students/:studentId', component: StudentDetail },
      { path: '/rights/:table', component: RightsTable },
      { path: '/directions', component: DirectionList },
      { path: '/directions/:directionId', component: DirectionDetail },
      { path: '/AddDirection', component: AddDirection },
      { path: '/profiles', component: ProfileList },
      { path: '/profiles/:profileId', component: ProfileDetail },
      { path: '/AddProfile', component: AddProfile },

      { path: '/groups', component: GroupList },
      { path: '/groups/:groupId', component: GroupDetail },
      { path: '/AddGroup', component: AddGroup },

      { path: '/courses', component: CourseList },
      { path: '/courses/:courseID', component: CourseDetail },
      { path: '/AddCourse', component: AddCourse },

      { path: '/listeners', component: ListenerList },
      { path: '/listeners/:listenerId', component: ListenerDetail },
      { path: '/AddListener', component: AddListener },

      { path: '/payers', component: PayerList },
      { path: '/payers/:payerId', component: PayerDetail },
      { path: '/Addpayer', component: AddPayer },

      { path: '/contracts', component: ContractList },
      { path: '/contracts/:contractId', component: ContractDetail },
      { path: '/AddContract', component: AddContract },

      { path: '/ScheduleLoads', component: ScheduleLoads },

      { path: '/addcw', component: AddCw },
      { path: '/courseworks', component: CWList },
      { path: '/courseworks/:CwId', component: CWdetail },

      { path: '/programs', component: ProgramList },
      { path: '/programs/:programId', component: ProgramDetail },
      { path: '/AddProgram', component: AddProgram },

      { path: '/payments', component: PaymentList },
      { path: '/payments/:paymentID', component: PaymentDetail },
      { path: '/AddPayment', component: AddPayment },

      { path: '/audits', component: AuditList },
      { path: '/audits/:scheduleId', component: AuditDetail },
      { path: '/AddAudit', component: AddAudit },




      { path: '/lgroups', component: lGroupList },
      { path: '/addlgroup', component: addLgroup },
      { path: '/lgroups/:groupId', component: lGroupDetail },
      {
        path: "/user",
        name: "user",
        // lazy-loaded
        component: BoardUser,
      },
      { path: '/AddStudent', component: AddStudent },
      { path: '/AddStudent/:groupName', component: AddStudent },]
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register', '/home'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (authRequired && !loggedIn) {
    next('/login'); // Redirect to login page if not logged in
  } else if (loggedIn) {
    const token = JSON.parse(loggedIn).accessToken;
    try {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // Token has expired, perform logout and redirect to login
        AuthService.logout();
        next('/login');
      } else {
        next(); // Continue to the intended route
      }
    } catch (error) {
      // Handle token decoding errors if needed
      next();
    }
  } else {
    next(); // Continue to the intended route (public page)
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
