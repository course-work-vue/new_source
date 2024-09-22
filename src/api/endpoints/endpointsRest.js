//API endpoints REST
const prefix = '/api/Query/rest/';
export default Object.freeze({
    student: prefix + 'students',
    group: prefix + 'groups',
    direction: prefix + 'directions',
    profile: prefix + 'profiles',
    courseWork: prefix + 'course_work',
    teacher: prefix + 'teachers',
    departament: prefix + 'departaments',
    role: prefix + 'roles',
    globalPermission: prefix + 'globalpermissions',
    functionUser: prefix + 'function_user',
    procedureUser: prefix + 'procedure_user',
    user: prefix + 'users',
});
