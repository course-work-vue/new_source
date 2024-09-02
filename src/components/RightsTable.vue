
<template>
    <div class="mt-4 list">
      <div>
      <div class="mb-3">
        <button @click="navigateToAddStudent" class="btn btn-primary" type="button">Добавить студента</button>
        <div class="col col-3 float-end">
        <input  class="form-control" v-model="searchQuery" @input="updateSearchQuery" placeholder="Поиск..."> 
      </div>
    </div>
        <!-- список студентов -->
        <table v-if="loading" class="table">
          <tbody>
          
            <td><div class="skeleton skeleton-animate"></div></td>
            <td><div class="skeleton skeleton-animate"></div></td>
            <td><div class="skeleton skeleton-animate"></div></td>
            <td><div class="skeleton skeleton-animate"></div></td>
            <td><div class="skeleton skeleton-animate"></div></td>
            <td><div class="skeleton skeleton-animate"></div></td>
          
        </tbody>
      </table>
      <table v-else class="table">
          <!-- таблица -->
          <thead>
        <tr>
          <th>Role Name</th>
          <th>Create</th>
          <th>Read</th>
          <th>Update</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(role, roleId) in groupedPermissions" :key="roleId">
          <td>{{ role[0].RoleName }}</td>
          <td><input type="checkbox" v-model="rolePermissions[roleId][0]" /></td>
          <td><input type="checkbox" v-model="rolePermissions[roleId][1]" /></td>
          <td><input type="checkbox" v-model="rolePermissions[roleId][2]" /></td>
          <td><input type="checkbox" v-model="rolePermissions[roleId][3]" /></td>
        </tr>
      </tbody>
        </table>
        <button @click="savePermissions">Save Permissions</button>
  
        <!-- странички -->
        <nav class="float-start">
          <ul class="pagination">
            <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
              <button @click="prevPage" class="page-link">Предыдущая страница</button>
            </li>
            <li class="page-item" v-for="pageNumber in pageRange" :key="pageNumber" :class="{ 'active': pageNumber == currentPage }">
              <button @click="changePage(pageNumber)" class="page-link">{{ pageNumber }}</button>
            </li>
            <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
              <button @click="nextPage" class="page-link">Следующая страница</button>
            </li>
          </ul>
        </nav>

      </div>
    </div>
    </template>
    
    <script>
  
    import UserService from "../services/user.service";
  
  
  
  
    export default {
    
  
      data() {
  
  
  
  
        return {
  
          
          permissions: [], // Fetch your data from the API or database
          currentPage: 1, // теущий номер страницы
          permissionsPerPage: 10, // кол-во студентов на странице
          maxPageButtons: 3,
          loading: true,
          searchQuery: '',

          rolePermissions: {},
        };
      },
      computed: {
        // подсчет страниц
        groupedPermissions() {

            const startIndex = (this.currentPage - 1) * this.permissionsPerPage;
    const endIndex = startIndex + this.permissionsPerPage;
    const filteredpermissions = this.filterpermissions();
    const filtered=filteredpermissions.slice(startIndex, endIndex);

      // Group permissions by RoleId
      const grouped = {};
      filtered.forEach((permission) => {
        const roleId = permission.RoleId;
        if (!grouped[roleId]) {
          grouped[roleId] = [];
        }
        grouped[roleId].push(permission);
        
        // Initialize rolePermissions for each roleId
        if (!this.rolePermissions[roleId]) {
          this.rolePermissions[roleId] = [false, false, false, false];
        }
        
        // Check checkboxes based on the Operation value
        const operation = permission.Operation;
        this.rolePermissions[roleId][operation] = true;
      });
      return grouped;
    },
    totalPages() {
      const filteredpermissions = this.filterpermissions();
      return Math.ceil(filteredpermissions.length / this.permissionsPerPage);
    },
    paginatedpermissions() {
      const startIndex = (this.currentPage - 1) * this.permissionsPerPage;
      const endIndex = startIndex + this.permissionsPerPage;
  
      const filteredpermissions = this.filterpermissions();
      return filteredpermissions.slice(startIndex, endIndex);
    },
    pageRange() {
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;
      const maxButtons = this.maxPageButtons;
      const ellipsis = '...';
  
      if (totalPages <= maxButtons) {
        // If total pages are less than or equal to the max buttons, show all pages
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
  
      // Calculate the start and end page numbers for the limited display
      const halfMaxButtons = Math.floor(maxButtons / 2);
      let startPage = Math.max(1, currentPage - halfMaxButtons);
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
      // Ensure that we always show maxButtons, if possible
      if (endPage - startPage + 1 < maxButtons) {
        startPage = endPage - maxButtons + 1;
      }
  
      // Insert an ellipsis and the last page when appropriate
      const pageRange = [];
  
      if (startPage > 1) {
        pageRange.push(1, ellipsis);
      }
  
      for (let i = startPage; i <= endPage; i++) {
        pageRange.push(i);
      }
  
      if (endPage < totalPages) {
        pageRange.push(ellipsis, totalPages);
      }
  
      return pageRange;
    },
      },
      methods: {
        savePermissions() {
      // Initialize arrays to track checked and unchecked permissions
      this.checkedPermissions = [];
      this.uncheckedPermissions = [];

      Object.keys(this.rolePermissions).forEach((roleId) => {
        this.rolePermissions[roleId].forEach((checked, operation) => {
          const existingPermission = this.permissions.find(
            (permission) =>
              permission.RoleId === parseInt(roleId) &&
              permission.Operation === operation
          );
          if (checked && !existingPermission) {
            // This permission is new; add it to the checkedPermissions array
            this.checkedPermissions.push({
              RoleId: parseInt(roleId),
              Operation: operation,
            });
          } else if (!checked && existingPermission) {
            // This permission was unchecked; add it to the uncheckedPermissions array
            this.uncheckedPermissions.push(existingPermission);
          }
        });
      });

      // Implement logic to save new permissions and remove unchecked permissions
      console.log("New Permissions to Insert:", this.checkedPermissions);
      console.log("Unchecked Permissions to Remove:", this.uncheckedPermissions);
    },
        async loadRightsTable() {
          const table = this.$route.params.table;
          try {
            const response = await UserService.getPermissionByTable(table);
            this.permissions = response.data;
            // Клонирование объекта, для избежание редактирования данных сразу
            this.loading=false;
          } catch (error) {
            console.error('Ошибка во время загрузки:', error);
          }
        },
        filterpermissions() {
      const queryString = this.searchQuery.toLowerCase();
      return this.permissions.filter(permissions => {
        return (
          String(permissions.RoleName).toLowerCase().includes(queryString) 
        );
      });
    },
 

  
        updateSearchQuery() {
    const query = { page: 1 }; // когда меняется фильтр летим на первую страницу
    if (this.searchQuery.trim() !== '') {
      query.search = this.searchQuery;
    }
    this.currentPage = 1; 
    this.$router.replace({ query });
  },
        // смена страницы
        changePage(pageNumber) {
    const query = { ...this.$route.query, page: pageNumber };
    if (this.searchQuery.trim() !== '') {
      query.search = this.searchQuery;
    }
    this.$router.replace({ query });
  },
        prevPage() {
          if (this.currentPage > 1) {
          this.changePage(this.currentPage - 1);
          }
        },
        nextPage() {
          if (this.currentPage < this.totalPages) {
            this.changePage(this.currentPage + 1);
          }
        },
        // смотрим детали о студенте
 
      
  
       
      },
  
      beforeRouteUpdate(to, from, next) {
    // берём филтр из роутера
    this.searchQuery = to.query.search || '';
    // берём страницу из роутера
    this.currentPage = parseInt(to.query.page) || 1;
    next();
  },
  
      created() {
      const query = this.$route.query;
      this.currentPage = parseInt(query.page) || 1;
      this.searchQuery = query.search || '';
     
      this.loadRightsTable();
      },
    };
    </script>
  
  <style>
  .skeleton {
    width: 100%;
    height: 1.2em;
    background-image: linear-gradient(125deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeletonShimmer 3.5s infinite linear;
    border-radius: 4px;
    margin: 0.2em 0;
  }
  
  
  
  @keyframes skeletonShimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  @keyframes skeletonFade {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
  </style>