export default class GlobalPermission {
  permissionid;
  roleid;
  schema_name;
  grant_create_db;
  grant_create_obj;
  grant_usage_schema;
  grant_update_tbl;
  grant_delete_tbl;
  grant_select_tbl;
  grant_insert_tbl;
  grant_truncate_tbl;
  grant_references_tbl;
  grant_trigger_tbl;
  grant_usage_seq;
  grant_select_seq;
  grant_update_seq;
  grant_execute_func;

  constructor(permission) {
    this.permissionid = permission?.permission_id ?? null;
    this.roleid = permission?.role_id ?? null;
    this.schema_name = permission?.schema_name ?? null;
    this.grant_create_db = permission?.grant_create_db ?? false;
    this.grant_create_obj = permission?.grant_create_obj ?? false;
    this.grant_usage_schema = permission?.grant_usage_schema ?? false;
    this.grant_update_tbl = permission?.grant_update_tbl ?? false;
    this.grant_delete_tbl = permission?.grant_delete_tbl ?? false;
    this.grant_select_tbl = permission?.grant_select_tbl ?? false;
    this.grant_insert_tbl = permission?.grant_insert_tbl ?? false;
    this.grant_truncate_tbl = permission?.grant_truncate_tbl ?? false;
    this.grant_references_tbl = permission?.grant_references_tbl ?? false;
    this.grant_trigger_tbl = permission?.grant_trigger_tbl ?? false;
    this.grant_usage_seq = permission?.grant_usage_seq ?? false;
    this.grant_select_seq = permission?.grant_select_seq ?? false;
    this.grant_update_seq = permission?.grant_update_seq ?? false;
    this.grant_execute_func = permission?.grant_execute_func ?? false;
  }

  hasFullPermissions() {
    return (
      this.grant_create_obj &&
      this.grant_update_tbl &&
      this.grant_delete_tbl &&
      this.grant_create_db
    );
  }

  hasCreatePermissions() {
    return this.grant_create_obj || this.grant_create_db;
  }
}
