<template>
  <div class="col-md-12 list">
    <div v-if="profile" >
      <Form @submit="updateProfile" :validation-schema="schema" v-slot="{ errors }">
        
        <div >
          
          <div class="form-group d-inline-flex align-items-center mb-2 col-12">
            <label for="group_id">Код направление:</label>
            
            <Select2 class="col-6" :class="{'form-control is-invalid': errors.group_id}" v-model="editedProfile.prof_dir_id" 
            :options="directions" 
            :settings=" { theme: 'bootstrap-5', width: '100%'}"
            
             />

             <Field  name="group_id" as="select" v-model="editedProfile.prof_dir_id" hidden>
              <option v-for="direction in directions" :key="direction.id" :value="direction.id">{{ direction.text }}</option>
            </Field>
            <ErrorMessage name="group_id" class="error-feedback" />
          </div>

          <div class="form-group d-inline-flex align-items-center mb-2 col-12">
            <label for="prof_name">Название профиля:</label>
            <Field name="prof_name" type="text" class="form-control" :class="{'is-invalid': errors.subgroup}" v-model="editedProfile.prof_name"/>
            <ErrorMessage name="prof_name" class="error-feedback" />
            
          </div>

          <div class="form-group mt-3">
   
            <button class="btn btn-primary btn-block float-end" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить профиль
            </button>
            <button type="button" class="btn btn-danger mx-2 float-end" @click="deleteProfile">
              Удалить профиль
            </button>
            <router-link to="/profiles" class="btn btn-secondary ml-2 float-start">Отмена</router-link>
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

import { Form, Field, ErrorMessage } from "vee-validate";
  import * as yup from "yup";
  import UserService from "../services/user.service";
  import { useToast } from "vue-toastification";
  export default {

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
        profile: null, // заглушка для данных студента
        editedProfile: null, // заглушка для новых данных студента
        directions: null,

      };
    },
    methods: {

      async deleteProfile() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deleteProfileById(this.profile.prof_id);
          response.data;
        
          this.loading=false;
          
          this.toast.success("Успешно удалили!");
          this.$router.push('/profiles');
        } catch (error) {
          console.error('Ошибка загрузки данных', error);
        }
      },
      // грузим студента из psql по id 
      async loadProfilesData() {
        const profileId = this.$route.params.profileId;
        try {
          const response = await UserService.getProfileById(profileId);
          this.profile = response.data;
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedProfile = { ...response.data };
        } catch (error) {
          console.error('Error:', error);
        }
      },
      // Метод для обновления данных о студенте
      async updateProfile() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updateProfileById(this.profile.prof_id, this.editedProfile.prof_dir_id, this.editedProfile.prof_name);
          response.data;
          this.profile = { ...this.editedProfile };
          this.loading=false;
          this.toast.success("Успешно обновили профиль!");
        } catch (error) {
          console.error('Ошибка загрузки данных о профиле:', error);
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