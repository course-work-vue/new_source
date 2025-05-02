import endpoints from '@/api/endpoints';
import ReqExec from '@/services/RequestExecutor';
ReqExec.baseUrl = 'https://ncatbird.ru/server';



//API methods
export default {

    uploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);


        return ReqExec.postFile(endpoints.directLinks.uploadFile, file)

    },
    //student
    getStudentList: () => ReqExec.get(endpoints.rest.student, null, true),
    getStudentCont: () => ReqExec.get(endpoints.rest.cont, null, true),
    postStudent: (student) => ReqExec.post(endpoints.rest.student, student),
    putStudent: (student_id, student) => ReqExec.put(endpoints.rest.student, student_id, student),
    deleteStudent: (student) => ReqExec.put(endpoints.procedure.student, student.student_id, student),
    //direction
    getDirectionList: () => ReqExec.get(endpoints.rest.direction, null, true),
    postDirection: (direction) => ReqExec.post(endpoints.rest.direction, direction),
    putDirection: (direction_id, direction) => ReqExec.put(endpoints.rest.direction, direction_id, direction),
    deleteDirection: (direction) => ReqExec.put(endpoints.procedure.direction, direction.direction_id, direction),
    //profile
    getProfileList: () => ReqExec.get(endpoints.rest.profile, null, true),
    postProfile: (profile) => ReqExec.post(endpoints.rest.profile, profile),
    putProfile: (profile_id, profile) => ReqExec.put(endpoints.rest.profile, profile_id, profile),
    deleteProfile: (profile) => ReqExec.put(endpoints.procedure.profile, profile.profile_id, profile),
    //group
    getGroupList: () => ReqExec.get(endpoints.rest.group, null, true),
    postGroup: (group) => ReqExec.post(endpoints.rest.group, group),
    putGroup: (group_id, group) => ReqExec.put(endpoints.rest.group, group_id, group),
    deleteGroup: (group) => ReqExec.put(endpoints.procedure.group, group.group_id, group),

    //courseWork
    getCourseWorkList: () => ReqExec.get(endpoints.rest.courseWork, null, true),
    postCourseWork: (courseWork) => ReqExec.post(endpoints.rest.courseWork, courseWork),
    putCourseWork: (courseWork_id, courseWork) => ReqExec.put(endpoints.rest.courseWork, courseWork_id, courseWork),
    deleteCourseWork: (courseWork) => ReqExec.put(endpoints.procedure.courseWork, courseWork.courseWork_id, courseWork),

    //departament
    getDepartamentList: () => ReqExec.get(endpoints.rest.departament, null, true),

    //teacher
    getTeacherList: () => ReqExec.get(endpoints.rest.teacher, null, true),

    // СЛУШАТЕЛИ

  getListenerList: () => ReqExec.get(endpoints.rest.listener, null, true),
  postListener: (listener) => ReqExec.post(endpoints.rest.listener, listener),
  putListener: (id, listener) =>
    ReqExec.put(endpoints.rest.listener, id, listener),
  deleteListener: (listener) =>
    ReqExec.put(endpoints.procedure.listener, listener.id, listener),

  getDayList: () => ReqExec.get(endpoints.rest.day, null, true),
  getL_Group_StatusList: () => ReqExec.get(endpoints.rest.l_group_status, null, true),

  getReady_ListenerList:() => ReqExec.get(endpoints.rest.ready_listener, null, true),
  getListener_WishList: () => ReqExec.get(endpoints.rest.listener_wish, null, true),
  postListener_Wish: (listener_wish) => ReqExec.post(endpoints.rest.listener_wish, listener_wish),
  putListener_Wish: (id, listener_wish) =>
      ReqExec.put(endpoints.rest.listener_wish, id, listener_wish),

  getContractList: () => ReqExec.get(endpoints.rest.contract, null, true),
  postContract: (contract) => ReqExec.post(endpoints.rest.contract, contract),
  putContract: (id, contract) =>
    ReqExec.put(endpoints.rest.contract, id, contract),
  deleteContract: (contract) =>
    ReqExec.put(endpoints.procedure.contract, contract.id, contract),

  getListenergroupList: () => ReqExec.get(endpoints.rest.l_group, null, true),
  postListenergroup: (l_group) => ReqExec.post(endpoints.rest.l_group, l_group),
  putListenergroup: (id, l_group) =>
    ReqExec.put(endpoints.rest.l_group, id, l_group),
  deleteListenergroup: (l_group) =>
    ReqExec.put(endpoints.procedure.l_group, l_group.id, l_group),

  getPayerList: () => ReqExec.get(endpoints.rest.payer, null, true),
  postPayer: (payer) => ReqExec.post(endpoints.rest.payer, payer),
  putPayer: (id, payer) =>
    ReqExec.put(endpoints.rest.payer, id, payer),
  deletePayer: (payer) =>
    ReqExec.put(endpoints.procedure.payer, payer.id, payer),

  getPaymentList: () => ReqExec.get(endpoints.rest.pay_graph, null, true),
  postPayment: (pay_graph) => ReqExec.post(endpoints.rest.pay_graph, pay_graph),
  putPayment: (id, pay_graph) =>
    ReqExec.put(endpoints.rest.pay_graph, id, pay_graph),
  deletePayment: (pay_graph) =>
    ReqExec.put(endpoints.procedure.pay_graph, pay_graph.id, pay_graph),

  getProgramList: () => ReqExec.get(endpoints.rest.program, null, true),
  postProgram: (program) => ReqExec.post(endpoints.rest.program, program),
  putProgram: (id, program) =>
    ReqExec.put(endpoints.rest.program, id, program),
  deleteProgram: (program) =>
    ReqExec.put(endpoints.procedure.program, program.id, program),
  
  //ИМПОРТ

  getImport_ProgramList: () => ReqExec.get(endpoints.rest.import_program, null, true),
  getImport_ProgramYearsList: () => ReqExec.get(endpoints.rest.import_program_years, null, true),
  getImport_ProgramCodesList: () => ReqExec.get(endpoints.rest.import_program_codes, null, true),
  postImport_Program: (import_program) => ReqExec.post(endpoints.rest.import_program, import_program),
  postImport_Programs: (import_programs) => ReqExec.post(endpoints.rest.import_programs, import_programs),

  //direction code?
  putImport_Program: (direction_code, import_program) =>
    ReqExec.put(endpoints.rest.import_program, direction_code, import_program),
  deleteImport_Program: (import_program) =>
    ReqExec.put(endpoints.procedure.import_program, import_program.id, import_program),

  getImport_DiscipleList: () => ReqExec.get(endpoints.rest.import_disciple, null, true),
  postImport_Disciple: (import_disciple) => ReqExec.post(endpoints.rest.import_disciple, import_disciple),
  putImport_Disciple: (direction_code, import_disciple) =>
    ReqExec.put(endpoints.rest.import_disciple, direction_code, import_disciple),
  deleteImport_Disciple: (import_disciple) =>
    ReqExec.put(endpoints.procedure.import_disciple, import_disciple.id, import_disciple),

  //role
  getRoleList: () => ReqExec.get(endpoints.function_end.selectRole, null, true),
  postRole: (role) => ReqExec.post(endpoints.procedure.role, role), //to:do
  putRole: (roleid, role) => ReqExec.put(endpoints.rest.role, roleid, role),
  deleteRole: (role) => ReqExec.put(endpoints.procedure.role, role.roleid, role),
  //globalPermission
  getGlobalPermissionList: () => ReqExec.get(endpoints.rest.globalPermission, null, true),
  postGlobalPermission: (globalPermission) => ReqExec.post(endpoints.rest.globalPermission, globalPermission),
  putGlobalPermission: (permissionid, globalPermission) => ReqExec.put(endpoints.rest.globalPermission, permissionid, globalPermission),
  deleteGlobalPermission: (globalPermission) => ReqExec.put(endpoints.procedure.globalPermission, globalPermission.permissionid, globalPermission),
  //functionUser
  getFunctionUserList: () => ReqExec.get(endpoints.function_end.functionUser, null, true),
  postFunctionUser: (functionUser) => ReqExec.post(endpoints.directLinks.createFunction, functionUser),
  putFunctionUser: (id, functionUser) => ReqExec.put(endpoints.directLinks.updateFunctionFromSql, id, functionUser),
  deleteFunctionUser: (functionUser) => ReqExec.put(endpoints.procedure.deleteFunctionUser, functionUser, functionUser),
  //procedureUser+
  getProcedureUserList: () => ReqExec.get(endpoints.function_end.procedureUser, null, true),
  postProcedureUser: (procedureUser) => ReqExec.post(endpoints.directLinks.createProcedure, procedureUser),
  putProcedureUser: (id, procedureUser) => ReqExec.put(endpoints.directLinks.updateProcedureFromSql, id, procedureUser),
  deleteProcedureUser: (procedureUser) => ReqExec.put(endpoints.procedure.deleteProcedureUser, procedureUser, procedureUser),
  //tableUser
  getTableUserList: () => ReqExec.get(endpoints.function_end.tableUser, null, true),
  postTableUser: (tableUser) => ReqExec.post(endpoints.directLinks.createTable, tableUser),
  putTableUser: (id, tableUser) => ReqExec.post(endpoints.directLinks.updateTableFromSql, tableUser),//to:do
  deleteTableUser: (tableUser) => ReqExec.post(endpoints.directLinks.deleteTableFromSql, tableUser),//to:do
  //triggerUser
  getTriggerUserList: () => ReqExec.get(endpoints.function_end.triggerUser, null, true), 
  postTriggerUser: (triggerUser) => ReqExec.post(endpoints.directLinks.createTrigger, triggerUser),//to:do
  putTriggerUser: (id, triggerUser) => ReqExec.put(endpoints.directLinks.updateTriggerFromSql, id, triggerUser),//to:do
  deleteTriggerUser: (triggerUser) => ReqExec.put(endpoints.trigger.deleteTriggerUser, triggerUser, triggerUser),//to:do
  //user
  getUserList: () => ReqExec.get(endpoints.function_end.user, null, true),
  postUser: (user) => ReqExec.post(endpoints.directLinks.registerUser, user),//to:do
  putUser: (id, user) => ReqExec.put(endpoints.directLinks.updateUser, id, user),//to:do
  deleteUser: (user) => ReqExec.put(endpoints.procedure.user, user.id, user),//to:do
  deauthUser: (user) => ReqExec.post(endpoints.procedure.deauth_user, user),
  
  //userRole
  getUserRoleList: () => ReqExec.get(endpoints.function_end.userRole, null, true),
  postUserRole: (userRole) => ReqExec.post(endpoints.procedure.insertUserRole, userRole),
  deleteUserRole: (userRole) => ReqExec.post(endpoints.procedure.deleteUserRoleByUserId, userRole),
  //permission
  getPermissionList: () => ReqExec.get(endpoints.rest.permission, null, true),
  postPermission: (permission) => ReqExec.post(endpoints.rest.permission, permission),
  deletePermission: (permission) => ReqExec.put(endpoints.rest.permission, permission, permission),

};
