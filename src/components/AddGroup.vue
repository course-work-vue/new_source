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
              <label for="group_dir_id">Направление:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.group_dir_id}" v-model="myValue" 
              :options="directions" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="group_dir_id" as="select" v-model="myValue" hidden>
                <option v-for="direction in directions" :key="direction.id" :value="direction.id">{{ direction.text }}</option>
              </Field>
              <ErrorMessage name="group_dir_id" class="error-feedback" />
            </div>


            <div class="form-group d-inline-flex align-items-center col-10 mb-2">
              <label for="group_prof_id">Профиль:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.group_prof_id}" v-model="myValue2" 
              :options="profiles" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="group_prof_id" as="select" v-model="myValue2" hidden>
                <option v-for="profile in profiles" :key="profile.id" :value="profile.id">{{ profile.text }}</option>
              </Field>
              <ErrorMessage name="group_prof_id" class="error-feedback" />
            </div>


            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="course">Курс:</label>
              
              <Select2 class="col-5" :class="{'form-control is-invalid': errors.course}" v-model="myValue3" 
              :options="courses" 
              :settings=" { theme: 'bootstrap-5', width: '100%'}"
              
               />

               <Field  name="course" as="select" v-model="myValue3" hidden>
                <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.text }}</option>
              </Field>
              <ErrorMessage name="course" class="error-feedback" />
            </div>

            <div class="form-group d-inline-flex align-items-center col-5 mb-2">
              <label for="magister">Магистратура:</label>
              <Field name="magister" type="radio" id="magister2" value="false" class="form-check-input mt-0 ml-5" :class="{'is-invalid': errors.magister}"/>
              <label for="magister2">Нет</label>
              <Field name="magister" type="radio" id="magister1" value="true" class="form-check-input mt-0" :class="{'is-invalid': errors.magister}"/>
              <label for="magister1">Да</label>
             
              <ErrorMessage name="magister" class="error-feedback" />
              
            </div>

            <div class="form-group mt-3">
             
             <router-link to="/groups" class="btn btn-secondary ml-2 float-start">Отмена</router-link>
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
        courses: [
        { id: '1', text: '1' },
        { id: '2', text: '2' },
        { id: '3', text: '3' },
        { id: '4', text: '4' }
      ],
        myValue: '',
      };
    },
    computed: {

    },
    mounted() {
    
    },
    methods: {

      async addGroup(group) {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.addGroup(group.group_dir_id,group.group_prof_id,group.group_number,group.course,group.magister);
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