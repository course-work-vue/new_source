<template>
  <div class="col-md-12 list">
    <div v-if="group" >
      <Form @submit="updateGroup" :validation-schema="schema" v-slot="{ errors }">
        
        <div>

<div class="form-group d-inline-flex align-items-center col-5 mb-2">
    <label for="group_number">Номер группы:</label>
    <Field name="group_number" type="text" class="form-control" :class="{'is-invalid': errors.group_number}" v-model="editedGroup.group_number"/>
    <ErrorMessage name="group_number" class="error-feedback" />
    
  </div>


 

  <div class="form-group d-inline-flex align-items-center col-5 mb-2">
    <label for="group_program_id">Программа:</label>
    
    <Select2 class="col-5" :class="{'form-control is-invalid': errors.group_program_id}" v-model="editedGroup.group_program_id" 
    :options="programs" 
    :settings=" { theme: 'bootstrap-5', width: '100%'}"
    
     />

     <Field  name="group_program_id" as="select" v-model="editedGroup.group_program_id" hidden>
      <option v-for="program in programs" :key="program.id" :value="program.id">{{ program.text }}</option>
    </Field>
    <ErrorMessage name="group_program_id" class="error-feedback" />
  </div>

  <div class="form-group d-inline-flex align-items-center col-5 mb-2">
    <label for="hours">Общее количество часов:</label>
    <Field name="hours" type="number" class="form-control" :class="{'is-invalid': errors.hours}" v-model="editedGroup.hours"/>
    <ErrorMessage name="hours" class="error-feedback" />
    
  </div>

  <div class="form-group d-inline-flex align-items-center col-5 mb-2">
    <label for="start_date">Дата начала:</label>
    <Field id="start_date" name="start_date" type="date" class="form-control" :class="{'is-invalid': errors.start_date }" v-model="editedGroup.start_date"/>
    <ErrorMessage name="start_date" class="error-feedback" />
    
  </div>

  <div class="form-group d-inline-flex align-items-center col-5 mb-2">
    <label for="end_date">Дата окончания:</label>
    <Field id="end_date" name="end_date" type="date" class="form-control" :class="{'is-invalid': errors.end_date}" v-model="editedGroup.end_date"/>
    <ErrorMessage name="end_date" class="error-feedback" />
    
  </div>

  <div class="col-9">
    <table class="table table-bordered col col-3">
      <thead>
      <tr>
        <th>День</th>
        <th>Время начала</th>
        <th>Время окончания</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(entry, index) in tableData" :key="index" >
        
        <td>
          <select class="form-select" v-model="entry.day_id">
            <option v-for="day in days" :key="day.value" :value="day.id">
              {{ day.text }}
            </option>
          </select>
        </td>
        <td>
          <input class="form-control" type="time" v-model="entry.starttime">
        </td>
        <td>
          <input class="form-control" type="time" v-model="entry.endtime">
        </td>
      
      </tr>
    </tbody>
    </table>
    <button type="button" class="btn btn-primary" @click="addRow">+</button>
  </div>


  <div class="form-group d-inline-flex align-items-center col-5 mb-2">
    <label for="people_count">Общее количество человек:</label>
    <Field id="people_count" name="people_count" type="number" class="form-control" :class="{'is-invalid': errors.pc}" v-model="editedGroup.people_count"/>
    <ErrorMessage name="people_count" class="error-feedback" />
    
  </div>

  <div class="form-group mt-3">
   
   <router-link to="/lgroups" class="btn btn-secondary ml-2 float-start">Отмена</router-link>
   <button type="button" class="btn btn-danger mx-2 float-end" @click="deleteGroup">
              Удалить группу
            </button>
   <button class="btn btn-primary btn-block float-end" :disabled="loading">
     <span
       v-show="loading"
       class="spinner-border spinner-border-sm"
     ></span>
     Обновить группу
   </button>
 </div>
</div>    
      </Form>
     
      <br>
      <hr  size="2"  />
            <h2>Слушатели подходящие под критерий</h2>
             
             <div class="aggrid">
              <button @click=changeFilterStatus> Тест</button>
              <ag-grid-vue
    class="ag-theme-alpine"
    style="width: 100%; height: 100%;"
    :columnDefs="columnDefs.value"
    :rowData="rowData.value"
    :defaultColDef="defaultColDef"
    :isExternalFilterPresent="isExternalFilterPresent"
    :doesExternalFilterPass="doesExternalFilterPass"
    rowSelection="multiple"
    animateRows="true"
    @cell-clicked="cellWasClicked"
    @grid-ready="onGridReady"
    @firstDataRendered="onFirstDataRendered"
      
  >
  </ag-grid-vue>
            
            </div>
        
    </div>
    <div v-else>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
      <div class="form-group">
        <label class="form-control skeleton-text skeleton-animate"></label>
        <input type="text" class="form-control skeleton skeleton-animate">
      </div>
    </div>
      
      
   
      <div
        v-if="message"
        class="alert"
        :class="successful ? 'alert-success' : 'alert-danger'"
      >
        {{ message }}
      </div>
    </div>

</template>

  <script>
  /* eslint-disable */
import { AgGridVue } from "ag-grid-vue3";  // the AG Grid Vue Component
import { reactive, onMounted, ref } from "vue";
import ButtonCell from "@/components/ListenerButtonCell.vue";
import ListenerHref from "@/components/ListenerHrefCellRenderer.vue";
import ListenerHref2 from "@/components/ListenerHrefCellRenderer2.vue";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { Form, Field, ErrorMessage } from "vee-validate";
  import * as yup from "yup";
  import UserService from "../services/user.service";
  import { useToast } from "vue-toastification";
  export default {
    name: "App",
    components: {
      AgGridVue,
    ButtonCell,
    ListenerHref,
    ListenerHref2,
      Form,
      Field,
      ErrorMessage,



    },
    setup() {

         const toast = useToast();
      
    const gridApi = ref(null); // Optional - for accessing Grid's API
    const gridColumnApi = ref();
    // Obtain API from grid's onGridReady event

    const paginationPageSize = 60;
    
    let filterActive=ref(false);
    
    const changeFilterStatus = ()=>{
      filterActive=!filterActive;
      externalFilterChanged();
    }
    const onGridReady = (params) => {
      gridApi.value = params.api;
      gridColumnApi.value = params.columnApi;
     
    };
    const navigateToStudent = () => {
 
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
        onClick: navigateToStudent,
        label: 'View Details', // Button label
      },
      maxWidth: 120, resizable: false

    },
   
           
           { field: "full_name", headerName: 'ФИО'}, 

           {
            field: 'people_count',
            headerName: 'Желаемое количество человек'
           },
           {
            field: 'start_date',
            headerName: 'Дата начала'
           },
           {
            field: 'end_date',
            headerName: 'Дата окончания'
           },
           { field: "phone_number", headerName: 'Номер телефона', hide: true },
           { field: "email", headerName: 'Email', hide: true },
           { field: "full_name2", headerName: 'ФИО законного представителя' , hide: true
           },

           
         
      ],
    });
    const externalFilterChanged = () => {

      gridApi.value.onFilterChanged();
    };
    const isExternalFilterPresent = () => {
      // if ageType is not everyone, then we are filtering
      return true;
    };
    const doesExternalFilterPass = (node) => {
      console.log(node);
     
      console.log();
      if(filterActive){
      if (node.data) {
          console.log();
          return node.data.people_count==document.getElementById('people_count').value;

      }
    }
      return true;
    };
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
      paginationPageSize,
      onFilterTextBoxChanged,
      navigateToStudent,
      toast,
      isExternalFilterPresent,
      externalFilterChanged,
      doesExternalFilterPass,
      filterActive,
      changeFilterStatus




      

    };
  },




    data() {
      const schema = yup.object().shape({
        
      
       
      });

      return {
        schema,
        dataLoading:false,
        group: null, // заглушка для данных студента
        editedGroup: null, // заглушка для новых данных студента
        profiles: null,
        directions: null,
        show:false,
        programs:null,
        tableData:[],
        table_new_rows:false

      };
    },
    methods: {
      async deleteGroup() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deleteLgroupById(this.profile.prof_id);
          response.data;
        
          this.loading=false;
          
          this.toast.success("Успешно удалили!");
          this.$router.push('/profiles');
        } catch (error) {
          console.error('Ошибка загрузки данных', error);
        }
      },
      addRow() {
    
    const newRow = { day_id: '', starttime: '', endtime: '' }; // ensure this is a new object
    this.tableData.push(newRow);
    this.table_new_rows=true;
  },
      showlst(){  


      },

      onFirstDataRendered(params){
        
        
        this.gridApi = params.api;
      this.columnApi = params.columnApi;

      this.gridApi.onFilterChanged();
      },
      async loadListenersData() {
        try {
          const response = await UserService.getAllListenersWithoutGroup(); // Replace with your API endpoint
          this.rowData.value = Array.isArray(response.data) ? response.data : [response.data];
       
        } catch (error) {
          console.error('Error loading students data:', error);
        }
      },
      async updateGroup() {
        try {
          // запрос в psql
          this.loading=true;
          const groupId = this.$route.params.groupId;
          const response = await UserService.updateLgroupById(groupId, this.editedGroup.group_number,this.editedGroup.group_program_id,this.editedGroup.hours,this.editedGroup.start_date,this.editedGroup.end_date,this.editedGroup.people_count, this.tableData, this.table_new_rows);
          response.data;
          this.group = { ...this.editedgroup };
          this.toast.success("Успешно обновили группу!");
        } catch (error) {
          console.error('Ошибка загрузки данных о группе:', error);
        }
      },
      async loadGroupDetail() {
        const groupId = this.$route.params.groupId;
        try {
          const response = await UserService.getLgroupById(groupId);
          this.group = response.data;
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedGroup = { ...response.data };
        } catch (error) {
          console.error('Error', error);
        }
      },
      async loadProgramsData() {
        try {
          const response = await UserService.getProgramsAsIdText(); 
          this.programs = Array.isArray(response.data) ? response.data : [response.data];
          this.dataLoading=false;
        } catch (error) {
          console.error('Error:', error);
        }
      },
      async loadDaysData() {
        try {
          const response = await UserService.getDaysAsIdText(); 
          this.days = Array.isArray(response.data) ? response.data : [response.data];
          this.dataLoading=false;
        } catch (error) {
          console.error('Error loading data:', error);
        }
      },
      async load_gdays() {
        try {
          const GroupId = this.$route.params.groupId;
          const response = await UserService.getGDaysById(GroupId); 
          this.tableData = Array.isArray(response.data) ? response.data : [response.data];
          console.log(this.tableData);
          this.dataLoading=false;
        } catch (error) {
          console.error('Error loading data:', error);
        }
      },


    },
    created() {
      this.loadDaysData();
      this.loadGroupDetail();
      this.load_gdays();
      this.loadProgramsData();
      this.loadListenersData();
     
    },
  };
  </script>

<style lang="scss" scoped>
.aggrid{
  height: 500px;
}
label{
  margin-right: 15px;
  white-space: nowrap;
}
.form-group{
  margin-right: 20px;
}
.skeleton-text {
  width: 15%;
  height: 1.0em;
  background-image: linear-gradient(125deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 3.5s infinite linear;
  border-radius: 4px;
  margin: 0.2em 0;
}

.skeleton {
  width: 100%;
  height: 2.2em;
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
  padding-left: 100px;
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

.btn-primary:active{
  --bs-btn-bg: rgb(68,99,52);
  
}
.form-control:focus, .select2-container--bootstrap-5.select2-container--focus,.select2-container--bootstrap-5.select2-container--open .select2-selection {
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
.form-check-input:checked{
  background-color: rgb(68,99,52);
    border: none;
}
</style>