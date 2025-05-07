
export default class Schema {
    schemaname;
    fromdb;

    constructor(schema) {
        this.schemaname = schema?.schemaname ?? null;
        this.fromdb = schema?.fromdb ?? false;
    }


}
