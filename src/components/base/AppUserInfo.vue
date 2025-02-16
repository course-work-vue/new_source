<template>
  <li class="flex align-items-center">
    <Avatar icon="pi pi-user" class="mr-2" size="large" shape="circle" />
    <span class="text-lg">{{user ? user.username : 'Не в аккаунте'}}</span>
  </li>
</template>

<script setup>
import { ref } from 'vue';
//import { useAuthStore } from '@/stores/auth'
const user = ref(JSON.parse(localStorage.getItem('user')));
//const authStore = useAuthStore()
</script>
