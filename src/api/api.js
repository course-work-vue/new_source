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


    //role
    getRoleList: () => ReqExec.get(endpoints.rest.role, null, true),
    postRole: (role) => ReqExec.post(endpoints.function_end.insert_roles, role),
    putRole: (roleid, role) => ReqExec.put(endpoints.rest.role, roleid, role),
    deleteRole: (role) => ReqExec.put(endpoints.procedure.role, role.roleid, role),
    //globalPermission
    getGlobalPermissionList: () => ReqExec.get(endpoints.rest.globalPermission, null, true),
    postGlobalPermission: (globalPermission) => ReqExec.post(endpoints.rest.globalPermission, globalPermission),
    putGlobalPermission: (permissionid, globalPermission) => ReqExec.put(endpoints.rest.globalPermission, permissionid, globalPermission),
    deleteGlobalPermission: (globalPermission) => ReqExec.put(endpoints.procedure.globalPermission, globalPermission.permissionid, globalPermission),
    //functionUser
    getFunctionUserList: () => ReqExec.get(endpoints.rest.functionUser, null, true),
    postFunctionUser: (functionUser) => ReqExec.post(endpoints.directLinks.createFunction, functionUser),
    putFunctionUser: (id, functionUser) => ReqExec.put(endpoints.directLinks.updateFunctionFromSql, id, functionUser),
    deleteFunctionUser: (functionUser) => ReqExec.put(endpoints.procedure.deleteFunctionUser, functionUser, functionUser),
    //procedureUser
    getProcedureUserList: () => ReqExec.get(endpoints.rest.procedureUser, null, true),
    postProcedureUser: (procedureUser) => ReqExec.post(endpoints.directLinks.createProcedure, procedureUser),
    putProcedureUser: (id, procedureUser) => ReqExec.put(endpoints.directLinks.updateProcedureFromSql, id, procedureUser),
    deleteProcedureUser: (procedureUser) => ReqExec.put(endpoints.procedure.deleteProcedureUser, procedureUser, procedureUser),
    //user
    getUserList: () => ReqExec.get(endpoints.rest.user, null, true),
    postUser: (user) => ReqExec.post(endpoints.directLinks.registerUser, user),
    putUser: (id, user) => ReqExec.put(endpoints.directLinks.updateUser, id, user),
    deleteUser: (user) => ReqExec.put(endpoints.procedure.user, user.id, user),

};
