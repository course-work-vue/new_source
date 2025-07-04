import { ready } from "jquery";

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
    triggerUser: prefix + 'trigger_user',
    tableUser: prefix + 'table_user',
    userRole: prefix + 'userrole',
    user: prefix + 'users',
    permission: prefix + 'permissions',
    cont: prefix + 'contingent',

    profile: prefix + 'profiles',
    
    //СЛУШАТЕЛИ

    listener: prefix + 'listeners',
    ready_listener: prefix + 'ready_listeners',
    listener_wish:prefix + 'listener_wishes',
    day: prefix + 'days',
    l_wish_day: prefix + 'l_wish_days',
    l_group_wish_day: prefix + 'l_group_wish_days',
    l_group_status: prefix + 'l_group_status',
    l_ready_group: prefix + 'l_ready_groups',

    l_group: prefix + 'l_groups',
    listeners_group: prefix + 'listeners_groups',
    contract: prefix + 'contracts',
    payer: prefix + 'payers',
    pay_graph: prefix + 'pay_graph',
    program: prefix + 'programs',

    pdf_file: prefix + 'pdf_file',

    //ИМПОРТ

    uploaded_file: prefix+'uploaded_files',

    import_program: prefix+'import_programs',
    import_program_years: prefix + 'import_programs_years',
    import_program_codes: prefix + 'import_programs_codes',
    import_programs: prefix+'import_programs_f',

    import_disciple: prefix+'import_disciples',
    import_disciple_semestres: prefix+'import_disciple_semestres',
    import_disciple_departments: prefix+'import_disciple_departments',
});
