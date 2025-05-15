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
    getSchemas:prefix+'ums.get_schemas_json',

//журнал
    teacher_connections: prefix + 'select_teacher_connections',
    journal: prefix + 'select_journal',
    grade_types: prefix + 'select_grade_types',
    create_journal_date: prefix + 'create_journal_date',
    add_grade_type_to_date: prefix + 'add_grade_type_to_date',
    upsert_attendance: prefix + 'upsert_attendance',
    upsert_grade: prefix + 'upsert_grade',
    delete_journal_date: prefix + 'delete_journal_date',
    delete_grade_type_from_date: prefix + 'delete_grade_type_from_date',
    upsert_journal_date_comment: prefix + 'upsert_journal_date_comment',
    upsert_journal_date_grade_type: prefix +'upsert_journal_date_grade_type',
    get_report: prefix + 'get_report',
    select_directions_list: prefix + 'select_directions_list',
    select_courses_list: prefix + 'select_courses_list',
});
