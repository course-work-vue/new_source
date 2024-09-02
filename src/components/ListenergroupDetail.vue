<template>
  <div class="col-md-12 list">
    <div v-if="group" >
      <Form @submit="updateGroup" :validation-schema="schema" v-slot="{ errors }">
        
        <div >
          <div class="form-group d-inline-flex align-items-center col-5 mb-2">
            <label for="group_number">Номер группы</label>
            <Field name="group_number" type="text" class="form-control" :class="{'is-invalid': errors.group_number}" v-model="editedGroup.group_number"/>
            <ErrorMessage name="group_number" class="error-feedback" />
            
          </div>
          
          <div class="form-group d-inline-flex align-items-center col-5 mb-2">
            <label for="group_dir_id">Направление</label>
            
            <Select2 class="col-5" :class="{'form-control is-invalid': errors.group_dir_id}" v-model="editedGroup.group_dir_id" 
            :options="directions" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="group_dir_id" as="select" v-model="editedGroup.group_dir_id" hidden>
              <option v-for="direction in directions" :key="direction.id" :value="direction.id">{{ direction.text }}</option>
            </Field>
            <ErrorMessage name="group_dir_id" class="error-feedback" />
          </div>

          <div class="form-group d-inline-flex align-items-center col-10 mb-2">
            <label for="group_prof_id">Профиль</label>
            
            <Select2 class="col-5" :class="{'form-control is-invalid': errors.group_prof_id}" v-model="editedGroup.group_prof_id" 
            :options="profiles" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="group_prof_id" as="select" v-model="editedGroup.group_prof_id" hidden>
              <option v-for="profile in profiles" :key="profile.id" :value="profile.id">{{ profile.text }}</option>
            </Field>
            <ErrorMessage name="group_prof_id" class="error-feedback" />
          </div>

    
          <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="course">Курс:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.course}" v-model="editedGroup.course"
              :options="courses" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="course" as="select" v-model="editedGroup.course" hidden>
                <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.text }}</option>
              </Field>
              <ErrorMessage name="course" class="error-feedback" />
            </div>


            
            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="magister">Магистратура:</label>

              <Field v-slot="{ field2 }" name="magister" type="radio" :value="true">
                <label>
                  <input type="radio" name="magister" v-bind="field2" value="false" class="form-check-input mt-0 ml-5" v-model="editedGroup.magister" :checked="editedGroup.magister == false" />
                  Нет
                </label>
              </Field>
              <ErrorMessage name="magister" class="error-feedback" />
              <Field v-slot="{ field }" name="magister" type="radio" :value="true">
                <label>
                  <input type="radio" name="magister" v-bind="field" value="true" class="form-check-input mt-0 ml-5" v-model="editedGroup.magister" :checked="editedGroup.magister == true" />
                  Да
                </label>
              </Field>
            </div>
             
             
    
          <div class="form-group mt-3">
            <button class="btn btn-primary btn-block float-start" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить группу
            </button>
            <router-link to="/groups" class="btn btn-secondary ml-2 float-end">Отмена</router-link>
          </div>
        </div>
      </Form>
      

          
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
    components: {
    AgGridVue,
    ButtonCell,
    ListenerHref,
    ListenerHref2

  },
    setup() {
      const toast = useToast();
      return { toast }
    },
    components: {
      Form,
      Field,
      ErrorMessage,

      
    },


    data() {
      const schema = yup.object().shape({
        
      
       
      });

      return {
        schema,
        loading:false,
        group: null, // заглушка для данных студента
        editedGroup: null, // заглушка для новых данных студента
        profiles: null,
        directions: null,
        show:false,
        courses: [
        { id: '1', text: '1' },
        { id: '2', text: '2' },
        { id: '3', text: '3' },
        { id: '4', text: '4' }
      ],
      };
    },
    methods: {
      // грузим студента из psql по id 

      async updateGroup() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updateGroupById(this.group.group_id, this.editedGroup.group_dir_id, this.editedGroup.group_prof_id, this.editedGroup.group_number, this.editedGroup.course, this.editedGroup.magister);
          response.data;
          this.group = { ...this.editedgroup };
          this.loading=false;
          this.toast.success("Успешно обновили группу!");
        } catch (error) {
          console.error('Ошибка загрузки данных о студенте:', error);
        }
      },
      async loadGroupDetail() {
        const groupId = this.$route.params.groupId;
        try {
          const response = await UserService.getGroupById(groupId);
          this.group = response.data;
          console.log( this.group);
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedGroup = { ...response.data };
        } catch (error) {
          console.error('Error', error);
        }
      },
      // Метод для обновления данных о студенте
      async loadDirectionsData() {
        try {
          const response = await UserService.getDirectionsAsIdText(); 
          this.directions = Array.isArray(response.data) ? response.data : [response.data];
          this.dataLoading=false;
        } catch (error) {
          console.error('Error:', error);
        }
      },
      async loadProfilesData() {
        try {
          const response = await UserService.getProfilesAsIdText(); 
          this.profiles = Array.isArray(response.data) ? response.data : [response.data];
          this.dataLoading=false;
        } catch (error) {
          console.error('Error:', error);
        }
      }
    },
    created() {
      this.loadDirectionsData();
    this.loadProfilesData();
      this.loadGroupDetail();
     
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