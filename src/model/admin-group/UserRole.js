export default class UserRole {
    userRoleId;
    userId;
    roleId;

    constructor(userRole) {
        this.userRoleId = userRole?.userRoleId ?? null;
        this.userId = userRole?.userId ?? null;
        this.roleId = userRole?.roleId ?? null;
    }

    // Example method to get the user associated with this UserRole
    getUser() {
        //return userStore.userMap[this.userId] || null;
    }

    // Example method to get the role associated with this UserRole
    getRole() {
        //return roleStore.roleMap[this.roleId] || null;
    }


}
