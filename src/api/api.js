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
    //group
    getGroupList: () => ReqExec.get(endpoints.rest.group, null, true),
};
