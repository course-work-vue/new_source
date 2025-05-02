//API endpoints REST
const prefix = '/api/Query/';
const directPrefix = '/api/'
export default Object.freeze({
    uploadFile: prefix + 'uploadFile',
    createFunction: directPrefix + 'FunctionsList/CreateFunctionFromSql',
    updateFunctionFromSql: directPrefix + 'FunctionsList/UpdateFunctionFromSql',
    createProcedure: directPrefix + 'ProcedureList/CreateProcedureFromSql',
    updateProcedureFromSql: directPrefix + 'ProcedureList/UpdateProcedureFromSql',
    createTable: directPrefix + 'ProcedureList/CreateTableFromSql',
    updateTableFromSql: directPrefix + 'ProcedureList/UpdateTableFromSql',
    deleteTableFromSql: directPrefix + 'ProcedureList/DeleteTable',
    createTrigger: prefix + 'CreateTriggerFromSql',
    updateTriggerFromSql: prefix + 'UpdateTriggerFromSql',
    registerUser: directPrefix + 'Auth/register',
    updateUser: directPrefix + 'Auth/update',

});
