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

    listener: prefix + 'delete_listeners',
    contract: prefix + 'delete_contracts',
    l_group: prefix + 'delete_l_groups',
    payer: prefix + "delete_payers",
    pay_graph: prefix + 'delete_pay_graph',
    program: prefix + 'delete_programs',
    uploaded_file: prefix + 'delete_uploaded_files',

    deauth_user: prefix + 'update_user_auth_tokens',
});
