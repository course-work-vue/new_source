//API endpoints REST
const prefix = '/api/Query/anyFunction/';
export default Object.freeze({
    insert_roles: prefix + 'insert_roles',

    procedureUser: prefix + 'ums.select_procedure_user',
    tableUser: prefix + 'ums.select_table_user',
    role: prefix + 'ums.select_roles',
    permission: prefix + 'ums.select_permissions',
    user: prefix + 'ums.select_users',
});
