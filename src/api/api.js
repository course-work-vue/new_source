import endpoints from '@/api/endpoints';
import ReqExec from '@/services/RequestExecutor';
ReqExec.baseUrl = 'https://ncatbird.ru/server/';



//API methods
export default {
    //student
    getStudentList: () => ReqExec.get(endpoints.rest.student, null, true),
    postStudent: (student) => ReqExec.post(endpoints.rest.student, student),
    putStudent: (student_id, student) => ReqExec.put(endpoints.rest.student, student_id, student),
    deleteStudent: (student) => ReqExec.put(endpoints.procedure.student, student.student_id, student),
    //group
    getGroupList: () => ReqExec.get(endpoints.rest.group, null, true),
};
