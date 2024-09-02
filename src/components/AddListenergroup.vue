<template>
  <div class="list">
  <div v-if="dataLoading">
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
    <div v-else class="col-md-12">
        <Form @submit="addGroup" :validation-schema="schema" v-slot="{ errors }">
          <div>

          <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="group_number">Номер группы:</label>
              <Field name="group_number" type="text" class="form-control" :class="{'is-invalid': errors.group_number}"/>
              <ErrorMessage name="group_number" class="error-feedback" />
              
            </div>

          
           

            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="group_program_id">Программа:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.group_program_id}" v-model="myValue" 
              :options="programs" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="group_program_id" as="select" v-model="myValue" hidden>
                <option v-for="program in programs" :key="program.id" :value="program.id">{{ program.text }}</option>
              </Field>
              <ErrorMessage name="group_program_id" class="error-feedback" />
            </div>

            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="hours">Общее количество часов:</label>
              <Field name="hours" type="number" class="form-control" :class="{'is-invalid': errors.hours}"/>
              <ErrorMessage name="hours" class="error-feedback" />
              
            </div>
            <div class="col-5">
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
              <label for="start_date">Дата начала:</label>
              <Field name="start_date" type="date" class="form-control" :class="{'is-invalid': errors.start_date }"/>
              <ErrorMessage name="start_date" class="error-feedback" />
              
            </div>

            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="end_date">Дата окончания:</label>
              <Field name="end_date" type="date" class="form-control" :class="{'is-invalid': errors.end_date}"/>
              <ErrorMessage name="end_date" class="error-feedback" />
              
            </div>



            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="pc">Общее количество человек:</label>
              <Field name="pc" type="number" class="form-control" :class="{'is-invalid': errors.pc}"/>
              <ErrorMessage name="pc" class="error-feedback" />
              
            </div>

            <div class="form-group mt-3">
             
             <router-link to="/lgroups" class="btn btn-secondary ml-2 float-start">Отмена</router-link>
             <button class="btn btn-primary btn-block float-end" :disabled="loading">
               <span
                 v-show="loading"
                 class="spinner-border spinner-border-sm"
               ></span>
               Добавить группу
             </button>
           </div>
          </div>
        </Form>
  
        <div
          v-if="message"
          class="alert"
          :class="successful ? 'alert-success' : 'alert-danger'"
        >
          {{ message }}
        </div>
      </div>
    </div>
  </template>
  
  <script>


  import { Form, Field, ErrorMessage } from "vee-validate";
  import * as yup from "yup";
  import UserService from "../services/user.service";
  import { useToast } from "vue-toastification";
  export default {

    setup() {
      const toast = useToast();
      return { toast }
    },

    name: "AddGroup",
    components: {
      Form,
      Field,
      ErrorMessage,

      
    },
    data() {
      const schema = yup.object().shape({
        
       
       
      });
  
      return {
        successful: false,
        loading: false,
        dataLoading:true,
        message: "",
        schema,
        groups: null,
        profiles: null,
        directions: null,
        programs:null,
        myValue: '',
        tableData: [],
        days:null,
      };
    },
    computed: {

    },
    mounted() {
    
    },
    methods: {
      addRow() {
    
    const newRow = { day_id: '', starttime: '', endtime: '' }; // ensure this is a new object
    this.tableData.push(newRow);
  },
      async addGroup(lgroup) {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.addLgroup(lgroup.group_number,lgroup.group_program_id,lgroup.hours,lgroup.start_date,lgroup.end_date,lgroup.pc,this.tableData); 
          response.data;
          this.loading=false;
          this.successful=true;

          this.toast.success("Успешно добавили группу!");
        } catch (error) {
          this.message="Ошибка";
          this.toast.error("Ошибка добавления группы");
          console.error('Error:', error);
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


    },

    created() {
    this.loadDaysData();
    this.loadProgramsData();

    },
  };
  </script>

<style lang="scss" scoped>
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