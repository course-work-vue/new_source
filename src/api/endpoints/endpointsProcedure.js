//API endpoints REST
const prefix = '/api/Query/anyProcedure/';
export default Object.freeze({
    student: prefix + 'delete_students',
    group: prefix + 'delete_groups',
    direction: prefix + 'delete_directions',
    profile: prefix + 'delete_profiles',
    courseWork: prefix + 'delete_course_work',
    role: prefix + 'delete_roles',
    deleteFunctionUser: prefix + 'delete_function_user',
    deleteProcedureUser: prefix + 'delete_procedure_user',
    deleteUserRoleByUserId: prefix + 'delete_user_role_by_user_id',
});
