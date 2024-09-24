<template>


    <div class="col col-xs-9 col-lg-12 mt-4 list">
      <div class="col col-12 nad">
      <div class="mb-3 col col-12">
        <div class="d-inline-flex">
            <h1>Список {{ group_number }} группы</h1>
        </div>
        <div class="tesu">
          <h2>Преподаватель: {{ full_name_teacher }} </h2>
          <h3>Предмет: {{ subject_name }} </h3>
        </div>
        
    </div>
  </div>
  
  
  
  <div style="height: 67vh">
  <div class="h-100 pt-5">
    <ag-grid-vue
      class="ag-theme-alpine"
      style="width: 100%; height: 100%;"
      :columnDefs="columnDefs.value"
      :rowData="rowData.value"
      :getRowStyle="getRowStyle"
      :pinned-top-row-data="pinnedTopRowData"
      :pinned-bottom-row-data="pinnedBottomRowData"
      :defaultColDef="defaultColDef"
      rowSelection="multiple"
      animateRows="true"
      @cell-clicked="cellWasClicked"
      @grid-ready="onGridReady"
      @firstDataRendered="onFirstDataRendered"
      @filter-changed="onFilterChanged"
      :pagination="true"            
      :paginationPageSize="paginationPageSize"  
      @cellValueChanged="onCellValueChanged"
      

    >
    </ag-grid-vue>
    
  </div>
  </div></div>
  
  </template>
  
  <script>
  
  import { AgGridVue } from "ag-grid-vue3";  // the AG Grid Vue Component
  import { reactive, onMounted, ref } from "vue";
  import ButtonCell from "@/components/TegrsuButtonCell.vue";
  import JournalHref from "@/components/JournalHrefCellRenderer.vue";
  import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
  import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
  //import CustomPinnedRowRenderer from '@/customPinnedRowRendererVue.js';
  import UserService from "../services/user.service";
import { date } from "yup";
  
  /* eslint-disable vue/no-unused-components */
  export default {
    name: "App",
    components: {
      AgGridVue,
      ButtonCell,
      JournalHref,
     // CustomPinnedRowRenderer
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
            { field: "group_number", headerName: 'number',hide:true},
            { field: "group_id", headerName: 'id',hide:true},
            {field: "subject_name",headerName: 'subject_name',hide:true},
            {field:"full_name_teacher",headerName: 'full_name_teacher',hide:true},
            { field: "full_name", headerName: 'ФИО',pinned: 'left',minWidth:300,lockPinned: true},
            { field: "j_id", headerName: 'j_id',hide:true},
            
            { field: "date", width:200, flex:1,
            headerName: '12.09.2024',
              children: [
                          {
                        
                        field: "status",
                        editable: true,
                        headerName: 'Пр',
                        maxWidth:80,
                        resizable: false,
                        cellEditor: "agSelectCellEditor",
                        cellEditorParams: {
                          values: ['н', 'уп', 'б',''],
                        },
                        cellRenderer: 'agRichSelectCellRenderer'
                        },
                              {
                          field: "grade",
                          editable: true,
                        headerName: 'Т/к',
                        maxWidth:80,
                        resizable:false,
                        cellEditor: "agTextCellEditor",

                        valueFormatter: params => {
                          if(params.value === '[null]')
                        return params.value=' ';
                          },
                        cellStyle: params => {
                        if (params.value === 2) {
                           return { backgroundColor: 'LightCoral'};
                        }
                        if (params.value === 5) {
                           return { backgroundColor: 'LightGreen'};
                        }
                        if (params.value === 3) {
                           return { backgroundColor: '#FFFF66'};
                        }
                        if (params.value === 4) {
                           return { backgroundColor: 'lightblue'};
                        }
                        if (params.value === null) {
                           return { backgroundColor: 'transparent'};
                        }
                        return null;
                        },
                            },
                            {columnGroupShow: "open",
                          field: "gradekr",
                          editable: true,
                        headerName: 'К/р',
                        maxWidth:80,
                        resizable:false,
                        cellEditor: "agTextCellEditor",

                        valueFormatter: params => {
                          if(params.value === '[null]')
                        return params.value=' ';
                          },
                        cellStyle: params => {
                        if (params.value === 2) {
                           return { backgroundColor: 'LightCoral'};
                        }
                        if (params.value === 5) {
                           return { backgroundColor: 'LightGreen'};
                        }
                        if (params.value === 3) {
                           return { backgroundColor: '#FFFF66'};
                        }
                        if (params.value === 4) {
                           return { backgroundColor: 'lightblue'};
                        }
                        if (params.value === null) {
                           return { backgroundColor: 'transparent'};
                        }
                        return null;
                        },
                            }
                            


                      ],
                          },
                          { field: "date", width:200, flex:1,
            headerName: '13.09.2024',
              children: [
                          {
                        field: "status2",
                        editable: true,
                        resizable:false,
                        headerName: 'Пр',
                        maxWidth:80,
                        cellEditor: "agSelectCellEditor",
                        cellEditorParams: {
                          values: ['н', 'уп', 'б',''],
                        },
                        cellRenderer: 'agRichSelectCellRenderer' 
                        },
                              {
                          field: "grade2",
                          editable: true,
                        headerName: 'Т/к',
                        resizable:false,
                        maxWidth:80,
                        cellEditor: "agTextCellEditor",
                        
                        valueFormatter: params => {
                          if(params.value === '[object Object]')
                        return params.data.grade=' ';
                          },
                        cellStyle: params => {
                        if (params.value === 2) {
                           return { backgroundColor: 'LightCoral'};
                        }
                        if (params.value === 5) {
                           return { backgroundColor: 'LightGreen'};
                        }
                        if (params.value === 3) {
                           return { backgroundColor: '#FFFF66'};
                        }
                        if (params.value === 4) {
                           return { backgroundColor: 'lightblue'};
                        }
                        if (params.value === null) {
                           return { backgroundColor: 'transparent'};
                        }
                        return null;
                        },
                            },
                            {columnGroupShow: "open",
                          field: "gradekol",
                          editable: true,
                        headerName: 'Кол',
                        maxWidth:80,
                        resizable:false,
                        cellEditor: "agTextCellEditor",

                        valueFormatter: params => {
                          if(params.value === '[null]')
                        return params.value=' ';
                          },
                        cellStyle: params => {
                        if (params.value === 2) {
                           return { backgroundColor: 'LightCoral'};
                        }
                        if (params.value === 5) {
                           return { backgroundColor: 'LightGreen'};
                        }
                        if (params.value === 3) {
                           return { backgroundColor: '#FFFF66'};
                        }
                        if (params.value === 4) {
                           return { backgroundColor: 'lightblue'};
                        }
                        if (params.value === null) {
                           return { backgroundColor: 'transparent'};
                        }
                        return null;
                        },
                            }
                      ],
                          },
                          {
             valueGetter: params => {
                 return params.data.grade;
             },
             valueSetter: params => {
                 params.data.grade = params.newValue;
                 return true;
             },hide:true
         },
              {field: "Result", headerName: 'Итого',pinned: 'right',minWidth:300, 
                  children: [

                          {
                         
                        field: "kol-vopra",
                        headerName: "Пропусков",
                        pinned: 'right',
                        lockPinned:true,
                        
                        width:100,
                        valueGetter: abValueGetter
                        },
                              {
                         
                        field: "Sredn",
                        headerName: "Ср. балл",
                        pinned: 'right',
                        lockPinned:true,
                        
                        width:100,
                        valueGetter: absrValueGetter,
                        cellStyle: params => {
                        if (params.value >= 2 && params.value < 3) {
                           return { backgroundColor: 'LightCoral'};
                        }
                        if (params.value >= 4 && params.value <= 5) {
                           return { backgroundColor: 'LightGreen'};
                        }
                        if (params.value >= 3 && params.value < 4) {
                           return { backgroundColor: '#FFFF66'};
                        }
                        if (params.value === null) {
                           return { backgroundColor: 'transparent'};
                        }
                        
                        return null;
                        },
                        valueFormatter: params => {
                          if(params.value === '[[Prototype]]: Object')
                        return params.value=' ';
                          },
                            }
                      ],}
           
        ],
      });
      function abValueGetter(params) {
      let totalAbsences = 0;
      if (['н', 'б','уп'].includes(params.data.status)) {
        totalAbsences++;
      }
      if (['н', 'б','уп'].includes(params.data.status2)) {
        totalAbsences++;
      }
      return totalAbsences;
    }
function absrValueGetter(params) {
  return (params.data.grade*5+params.data.grade2*5+params.data.gradekr*20+params.data.gradekol*50)/80;
}
      // DefaultColDef sets props common to all Columns
      const defaultColDef = {
        sortable: true,
        filter: true,
        
        resizable: true,
        
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
      group_number: null,
      quickFilterValue: '',
      filters:false,
      pinnedTopRowData: null,
      pinnedBottomRowData: null,
      full_name_teacher:null,
      subject_name:null
    };
  },
  
  mounted() {
    this.extractGroupNumber();
    this.extractFullNameTeacher();
    this.extractFSubjectName();
  },
    
    methods: {
      
      extractGroupNumber() {
      const filterModelString = this.getQueryParameter('filterModel');
      
      if (filterModelString) {
        try {
          const filterModel = JSON.parse(decodeURIComponent(filterModelString));
          
          // Проверяем наличие номера группы в filterModel
          if (filterModel.group_number && filterModel.group_number.filter) {
            this.group_number = filterModel.group_number.filter;
          }
        } catch (e) {
          console.error('Ошибка разбора filterModel:', e);
        }
      }
    },
    extractFullNameTeacher() {
      const filterModelString = this.getQueryParameter('filterModel');
      
      if (filterModelString) {
        try {
          const filterModel = JSON.parse(decodeURIComponent(filterModelString));
          
          // Проверяем наличие номера группы в filterModel
          if (filterModel.full_name_teacher && filterModel.full_name_teacher.filter) {
            this.full_name_teacher = filterModel.full_name_teacher.filter;
          }
        } catch (e) {
          console.error('Ошибка разбора filterModel:', e);
        }
      }
    },
    extractFSubjectName() {
      const filterModelString = this.getQueryParameter('filterModel');
      
      if (filterModelString) {
        try {
          const filterModel = JSON.parse(decodeURIComponent(filterModelString));
          
          // Проверяем наличие номера группы в filterModel
          if (filterModel.subject_name && filterModel.subject_name.filter) {
            this.subject_name = filterModel.subject_name.filter;
          }
        } catch (e) {
          console.error('Ошибка разбора filterModel:', e);
        }
      }
    },
    getQueryParameter(name) {
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
      return urlParams.get(name);
    },
    
      async loadJournalsData() {
          try {
            const response = await UserService.getAllJournals(); // Replace with your API endpoint
            this.rowData.value = Array.isArray(response.data) ? response.data : [response.data];
            this.loading=false;
          } catch (error) {
            console.error('Error loading journal data:', error);
          }
        },
        navigateToUpdateJournal(j_id) {
  this.$router.push(`/updateJournalById/${j_id}`); // Navigate to the Update Journal route with the journal ID
},

async onCellValueChanged(event) {
  const updatedData = event.data; // Получаем информацию об изменённой строке
  
  // Предполагается, что у updatedData есть поле j_id
  if (!updatedData.j_id) {
    console.error('Ошибка: отсутствует идентификатор журнала для обновления');
    return;
  }

  this.loading = true; // Начало загрузки

  const { j_id,status,grade,gradekr,gradekol,status2,grade2 } = updatedData;
  console.log(updatedData);
  try {
    const response = await UserService.updateJournalById(j_id,status,grade,gradekr,gradekol,status2,grade2);
    
    if (response.status === 200) {
      console.log('Данные успешно обновлены:', updatedData);
      
    } else {
      console.error('Ошибка при обновлении данных:', response);
      
    }
  } catch (error) {
    console.error('Ошибка при обновлении данных:', error);
    
  } finally {
    this.loading = false; // Завершение загрузки
  }
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
      
      this.loadJournalsData();

      },
  
      
  };
  
  
  </script>
  
  <style lang="scss" scoped>
  .ag-header-group-cell {
    justify-content: center;
  }
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
    padding-left: 0px;
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
      padding-left: 0px;
      font-size: 13px;
  
    }
  }
  @media (min-width: 1023px) {
  
    .nad h1{
      margin-bottom: -150px;
      margin-top:-100px;
    }
    .nad h2 {
  font-size: 20px; /* Настройте размер шрифта по вашему усмотрению */
  font-weight: normal; /* Установите нормальное начертание */
  margin-top:-50px;
}
.nad h3{
  font-size: 20px; /* Настройте размер шрифта по вашему усмотрению */
  font-weight: normal; /* Установите нормальное начертание */
  margin-top:-10px;
}
  .nad{
    margin-bottom: -70px;
  }
  .list{
    padding-left: 0px;
    padding-right: 5px;
    margin-top:-20px;
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