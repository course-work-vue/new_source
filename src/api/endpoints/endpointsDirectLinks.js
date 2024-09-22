//API endpoints REST
const prefix = '/api/Query/';
const directPrefix = '/api/'
export default Object.freeze({
    uploadFile: prefix + 'uploadFile',
    createFunction: prefix + 'CreateFunctionFromSql',
    updateFunctionFromSql: prefix + 'UpdateFunctionFromSql',
    createProcedure: prefix + 'CreateProcedureFromSql',
    updateProcedureFromSql: prefix + 'UpdateProcedureFromSql',
    registerUser: directPrefix + 'Auth/register',
    updateUser: directPrefix + 'Auth/update'
});
