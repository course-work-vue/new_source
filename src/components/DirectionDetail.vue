<template>
  <div class="col-md-12 list">
    <div v-if="direction" >
      <Form @submit="updateDirection" :validation-schema="schema" v-slot="{ errors }">
        
        <div >
          <div class="form-group d-inline-flex align-items-center col-5 mb-2">
            <label for="dir_name">Название направления</label>
            <Field name="dir_name" type="text" value="" class="form-control" :class="{'is-invalid': errors.dir_name}" v-model="editedDirection.dir_name"/>
            <ErrorMessage name="dir_name" class="error-feedback" />
          </div>
          <div class="form-group d-inline-flex align-items-center col-5 mb-2">
            <label for="dir_code">Код направления</label>
            <Field name="dir_code" type="text" class="form-control" value="" :class="{'is-invalid': errors.dir_code}" v-model="editedDirection.dir_code"/>
            <ErrorMessage name="dir_code" class="error-feedback" />
          </div>
          
          
          

          <div class="form-group mt-3">
            <button class="btn btn-primary btn-block float-end" :disabled="loading">
              <span
                v-show="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Обновить направление
            </button>
            <div class="form-group float-end">
            <button type="button" class="btn btn-danger float-end" @click="deleteDirection">
              Удалить направление
            </button>
          </div>
            <router-link to="/directions" class="btn btn-secondary ml-2 float-start">Отмена</router-link>
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
        direction: null, // заглушка для данных студента
        editedDirection: null, // заглушка для новых данных студента
        groups: null,

      };
    },
    methods: {
      async deleteDirection() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.deleteDirectionById(this.direction.dir_id);
          response.data;
          this.direction = { ...this.editedStudent };
          this.loading=false;
          
          this.toast.success("Успешно удалили!");
          this.$router.push('/directions');
        } catch (error) {
          console.error('Ошибка загрузки данных', error);
        }
      },
      // грузим студента из psql по id 
      async loadDirectionDetail() {
        const directionId = this.$route.params.directionId;
        try {
          const response = await UserService.getDirectionById(directionId);
          this.direction = response.data;
          // Клонирование объекта, для избежание редактирования данных сразу
          this.editedDirection = { ...response.data };
        } catch (error) {
          console.error('Error:', error);
        }
      },
      // Метод для обновления данных о студенте
      async updateDirection() {
        try {
          // запрос в psql
          this.loading=true;

          const response = await UserService.updateDirectionById(this.direction.dir_id, this.editedDirection.dir_name, this.editedDirection.dir_code);
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
     
      this.loadDirectionDetail();
     
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