<template>
  <li class="flex align-items-center">
    <Avatar icon="pi pi-user" class="mr-2" size="large" shape="circle" />
    <span class="text-lg">{{ authStore.user ?  authStore.user.username : 'Гость' }}</span>
  </li>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../store2/auth";
const authStore = useAuthStore();
//const authStore = useAuthStore()
</script>
