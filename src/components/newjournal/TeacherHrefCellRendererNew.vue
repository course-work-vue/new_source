<template>
    <router-link 
      :to="{
        name: 'TeacherGroupsSubjects',
        params: { teacher_id: params.data.teacher_id }
      }"
      class="teacher-link"
    >
      {{ params.value }}
    </router-link>
  </template>
  
  <script>
  export default {
    props: ['params']
  }
  </script>
  
  <style lang="scss" scoped>
  .teacher-link {
    text-decoration: underline;
    color: #181d1f;
    cursor: pointer;
    transition: color 0.3s;
  
    &:hover {
      color: #126e2a;
      text-decoration: underline;
    }
  }
  </style>