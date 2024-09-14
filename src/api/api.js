import endpoints from '@/api/endpoints';
import ReqExec from '@/services/RequestExecutor';
ReqExec.baseUrl = 'https://ncatbird.ru/server';



//API methods
export default {
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
};
