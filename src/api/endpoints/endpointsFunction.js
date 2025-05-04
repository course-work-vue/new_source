//API endpoints REST
const prefix = '/api/Query/anyFunction/';
export default Object.freeze({
    insert_roles: prefix + 'insert_roles',

    procedureUser: prefix + 'ums.select_procedure_user',
    tableUser: prefix + 'ums.select_table_user',
    role: prefix + 'ums.select_roles',
    permission: prefix + 'ums.select_permissions',
    globalPermission: prefix + 'ums.select_globalpermissions',
    user: prefix + 'ums.select_users',
    triggerUser: prefix + 'ums.select_trigger_user',
    functionUser:prefix+'ums.select_function_user',
    userRole:prefix+'ums.select_userrole',
    selectRole:prefix+'ums.select_roles',
    postRole:prefix+'ums.insert_role',
});
