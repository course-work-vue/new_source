<template>


    <div class="col col-xs-9 col-lg-12 mt-4 list">
      <div class="col col-12 ">
      <div class="mb-3 col col-12">
        <div class="col col-6 float-end d-inline-flex align-items-center mb-2 ">
        <button @click="clearFilters" :disabled="!filters" class="btn btn-sm btn-primary text-nowrap mx-2" type="button"><i class="material-icons-outlined">close</i>Очистить фильтры</button>
        <input class="form-control" type="text" v-model="quickFilterValue" id="filter-text-box" v-on:input="onFilterTextBoxChanged()" placeholder="Поиск..."> 
      </div>
    </div>
  </div>
  
  
  
  <div style="height: 70vh">
  <div class="h-100 pt-5">
    <ag-grid-vue
      class="ag-theme-alpine"
      style="width: 100%; height: 100%;"
      :columnDefs="columnDefs.value"
      :rowData="rowData.value"
      :defaultColDef="defaultColDef"
      rowSelection="multiple"
      animateRows="true"
      @cell-clicked="cellWasClicked"
      @grid-ready="onGridReady"
      @firstDataRendered="onFirstDataRendered"
      @filter-changed="onFilterChanged"
      :pagination="true"            
      :paginationPageSize="paginationPageSize"  
    >
    </ag-grid-vue>
  </div>
  </div></div>
  
  </template>
  
  <script>
  
  import { AgGridVue } from "ag-grid-vue3";  // the AG Grid Vue Component
  import { reactive, onMounted, ref } from "vue";
  import ButtonCell from "@/components/TegrsuButtonCell.vue";
  import TegrsuHref from "@/components/TegrsuHrefCellRenderer.vue";
  import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
  import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
  import UserService from "../services/user.service";
  /* eslint-disable vue/no-unused-components */
  export default {
    name: "App",
    components: {
      AgGridVue,
      ButtonCell,
      TegrsuHref
    },
    setup() {
      const gridApi = ref(null); // Optional - for accessing Grid's API
      const gridColumnApi = ref();
      // Obtain API from grid's onGridReady event
  
      const paginationPageSize = 60;
  
  
      const onGridReady = (params) => {
        gridApi.value = params.api;
        gridColumnApi.value = params.columnApi;
       
      };
      const navigateToJournal = () => {
   
    };
  
  
  
      const rowData = reactive({}); // Set rowData to Array of Objects, one Object per Row
  
      // Each Column Definition results in one Column.
      const columnDefs = reactive({
        value: [
        {
        sortable: false,
        filter: false,
        headerName: 'Действия',
        cellRenderer: 'ButtonCell',
        cellRendererParams: {
          onClick: navigateToJournal,
          label: 'View Details', // Button label
        },
        maxWidth: 120, resizable: false, hide:true
  
      },
              { field: "teacher_id", headerName: 'teacher_id',hide:true },
              {field:"full_name_teacher",headerName:'full_name_teacher',hide:true},
             { field: "group_number", headerName: 'Группа', cellRenderer: "TegrsuHref" },
             { field: "subject_name", headerName: 'Предмет'},

             
           
        ],
      });
  
      // DefaultColDef sets props common to all Columns
      const defaultColDef = {
        sortable: true,
        filter: true,
        flex: 1,
        resizable: true,
        minWidth: 300
      };
  
      // Example load data from server
      onMounted(() => {
  
      });
  
      const onFilterTextBoxChanged = () => {
        gridApi.value.setQuickFilter(
          document.getElementById('filter-text-box').value
        );
      };
  
  
      return {
        onGridReady,
        columnDefs,
        rowData,
        defaultColDef,
        cellWasClicked: (event) => { // Example of consuming Grid Event
          console.log("cell was clicked", event);
        },
        deselectRows: () =>{
          gridApi.value.deselectAll()
        },
  
        onFilterTextBoxChanged,
        paginationPageSize,
        navigateToJournal,
  
  
        
  
      };
    },
    data() {
    return {
      quickFilterValue: '',
      filters:false
    };
  },
    methods: {
  
      async loadTegrsusData() {
          try {
            const response = await UserService.getAllTegrsus(); // Replace with your API endpoint
            this.rowData.value = Array.isArray(response.data) ? response.data : [response.data];
            this.loading=false;
          } catch (error) {
            console.error('Error loading Tegrsus data:', error);
          }
        },
        navigateToAddTegrsu() {
      
      this.$router.push(`/addTegrsu`); // Navigate to the AddTegrsu route
  },
  
  onFirstDataRendered(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
  
        // Check if filterModel exists in the route query
        const filterModelQuery = this.$route.query.filterModel;
        if (filterModelQuery) {
          const filterModel = JSON.parse(filterModelQuery);
          this.gridApi.setFilterModel(filterModel);
          this.filters=true;
          
        }
  
        const quickFilterQuery = this.$route.query.quickFilter;
        if (quickFilterQuery) {
          const quickFilter = JSON.parse(quickFilterQuery);
          this.gridApi.setQuickFilter(quickFilter);
          this.quickFilterValue = quickFilter;
          this.filters=true;
        }
      },
      onFilterChanged() {
    // This function will be called whenever filters change.
    // You can perform your desired action here.
    // For example, you can get the current filter model:
    this.filters=false;
    const savedQuickFilter = this.gridApi.getQuickFilter();
    const savedFilterModel = this.gridApi.getFilterModel();
  
    // Initialize an empty object for queryParams
    const queryParams = {};
  
    // Check if savedQuickFilter is not empty, then add it to queryParams
    if (savedQuickFilter) {
      queryParams.quickFilter = JSON.stringify(savedQuickFilter);
      this.filters=true;
    }
  
    // Check if savedFilterModel is not empty, then add it to queryParams
    if (savedFilterModel && Object.keys(savedFilterModel).length > 0) {
      queryParams.filterModel = JSON.stringify(savedFilterModel);
      this.filters=true;
    }
  
    // Push the query parameters to the router
    this.$router.push({ query: queryParams });
  
    // Do something with the filterModel or trigger other actions as needed.
  },
    clearFilters(){
  
    
      this.gridApi.setFilterModel();
      this.gridApi.setQuickFilter();
      this.quickFilterValue='';
      this.filters=false;
    },
  
      },
  
      created() {
      
      this.loadTegrsusData();
  
      },
  
      
  };
  
  
  </script>
  
  <style lang="scss" scoped>
  .ag-row .ag-cell {
  display: flex;
  justify-content: center; /* align horizontal */
  align-items: center;
}
  .skeleton {
    width: 100%;
    height: 1.2em;
    background-image: linear-gradient(125deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeletonShimmer 3.5s infinite linear;
    border-radius: 4px;
    margin: 0.2em 0;
  }
  
  .list{
    padding-left: 100px;
    font-size: 5px;

  }

    .text-center * {
      justify-content: center;
      display:flex 
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
  
  @media (max-width: 769px) {
    .list{
      padding-left: 100px;
      font-size: 10px;
      max-width: 1100px;
    }
  }
  
  @media (max-width: 1023px) {
  
  
  
    .list{
      padding-left: 100px;
      font-size: 13px;
  
    }
  }
  @media (min-width: 1023px) {
  
  
  
  .list{
    padding-left: 0px;
    padding-right: 5px;
  
  }
  }
  .nmbr{
    height: 44px;
  }
  
  
  
  .btn-primary{
      --bs-btn-bg: rgb(68,99,52);
      border: none;
      --bs-btn-hover-bg:rgb(6 215 29);
      --bs-btn-hover-border-color: rgb(6 215 29);
      --bs-btn-active-bg: rgb(68,99,52);
      --bs-btn-disabled-bg: rgb(68,99,52);
      display: flex;
    justify-content: center;
    align-items: center;
  }
  .form-control:focus {
    border-color: rgba(1, 20, 8, 0.815);
    box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
  }
  .form-select:focus {
    border-color: rgba(1, 20, 8, 0.815);
    box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
  }
  .page-link{
    height: 40px;
    width: 40px;
    margin: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .active{
    .page-link{
      background-color: rgb(68,99,52);
      border: none;
      --bs-btn-hover-bg:rgb(6 215 29);
      --bs-btn-hover-border-color: rgb(6 215 29);
   
    }
  }
  .disabled{
    .page-link{
      background-color: rgb(57, 79, 46);
      border: none;
      --bs-btn-hover-bg:rgb(6 215 29);
      --bs-btn-hover-border-color: rgb(6 215 29);
    }
  }
  </style>