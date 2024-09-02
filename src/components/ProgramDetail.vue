<template>
  <div class="col-md-12 list">
    <div v-if="program" >
      <Form @submit="updateProgram" :validation-schema="schema" v-slot="{ errors }">
        
        <div >
          <div class="form-group">
            <label for="required_amount">Стоимость обучения</label>
            <Field name="required_amount" type="text" value="" class="form-control" :class="{'is-invalid': errors.required_amount}" v-model="editedProgram.required_amount"/>
            <ErrorMessage name="required_amount" class="error-feedback" />
          </div>
          <div class="form-group">
            <label for="program_name">Название программы</label>
            <Field name="program_name" type="text" class="form-control" value="" :class="{'is-invalid': errors.program_name}" v-model="editedProgram.program_name"/>
            <ErrorMessage name="program_name" class="error-feedback" />
          </div>
          
          <div class="form-group">
            <label for="hours">Часы</label>
            <Field name="hours" type="number" class="form-control" value="" :class="{'is-invalid': errors.dir_code}" v-model="editedProgram.hours"/>
            <ErrorMessage name="hours" class="error-feedback" />
          </div>
          
          <div class="form-group">
            <label for="start_date">Начало обучения</label>
            <Field name="start_date" type="date" class="form-control" value="" :class="{'is-invalid': errors.start_date}" v-model="editedProgram.start_date"/>
            <ErrorMessage name="start_date" class="error-feedback" />
          </div>
          
          <div class="form-group">
            <label for="end_date">Конец обучния</label>
            <Field name="end_date" type="date" class="form-control" value="" :class="{'is-invalid': errors.end_date}" v-model="editedProgram.end_date"/>
            <ErrorMessage name="end_date" class="error-feedback" />
          </div>
          
          
          

          <div class="form-group mt-3">
            <button class="btn btn-primary btn-block float-start" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить направление
            </button>
            <button type="button" class="btn btn-danger mx-2 float-end" @click="deleteProgram">
              Удалить программу
            </button>
            <router-link to="/programs" class="btn btn-secondary ml-2 float-end">Отмена</router-link>
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
        program: null, // заглушка для данных студента
        editedProgram: null, // заглушка для новых данных студента
        groups: null,

      };
    },
    methods: {

      async deleteProgram() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deleteProgramById(this.editedProgram.id);
          response.data;
        
          this.loading=false;
          
          this.toast.success("Успешно удалили!");
          this.$router.push('/programs');
        } catch (error) {
          console.error('Ошибка загрузки данных', error);
        }
      },
      // грузим студента из psql по id 
      async loadProgramDetail() {
        const programId = this.$route.params.programId;
        try {
          const response = await UserService.getProgramById(programId);
          this.program = response.data;
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedProgram = { ...response.data };
        } catch (error) {
          console.error('Error:', error);
        }
      },
      // Метод для обновления данных о студенте
      async updateProgram() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updateProgramById(this.editedProgram.id, this.editedProgram.required_amount, this.editedProgram.program_name, this.editedProgram.hours, this.editedProgram.start_date, this.editedProgram.end_date);
          response.data;
          this.student = { ...this.editedStudent };
          this.loading=false;
          this.toast.success("Успешно обновили направление!");
        } catch (error) {
          console.error('Ошибка:', error);
        }
      },

    },
    created() {
     
      this.loadProgramDetail();
     
    },
  };
  </script>

<style lang="scss" scoped>

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