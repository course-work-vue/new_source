<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

import AppMenuItem from "./AppMenuItem.vue";
import AppUserInfo from "@/components/base/AppUserInfo.vue";

// Accessing Vuex store and Vue router
const store = useStore();
const router = useRouter();

// Define the logOut function
const logOut = () => {
  store.dispatch("auth/logout");
  router.push("/login");
};

// Menu model
const model = ref([
  {
    items: [
      {
        label: "Домой",
        icon: "pi pi-fw pi-home",
        to: "/home",
      },
      {
        label: "Студенты",
        icon: "pi pi-fw pi-users",
        items: [
          {
            label: "Список студентов",
            icon: "pi pi-fw pi-list",
            to: "/students",
          },
          {
            label: "Направления",
            icon: "pi pi-fw pi-directions",
            to: "/directions",
          },
          { label: "Профили", icon: "pi pi-fw pi-id-card", to: "/profiles" },
          { label: "Группы", icon: "pi pi-fw pi-users", to: "/groups" },
          { label: "Курсовые", icon: "pi pi-fw pi-book", to: "/courseworks" },
        ],
      },
      {
        label: "Слушатели",
        icon: "pi pi-fw pi-user-edit",
        items: [
          {
            label: "Список слушателей",
            icon: "pi pi-fw pi-list",
            to: "/listeners",
          },
          {
            label: "Плательщики",
            icon: "pi pi-fw pi-money-bill",
            to: "/payers",
          },
          { label: "Группы", icon: "pi pi-fw pi-users", to: "/lgroups" },
          { label: "Договора", icon: "pi pi-fw pi-file", to: "/contracts" },
          { label: "Программы", icon: "pi pi-fw pi-book", to: "/programs" },
          {
            label: "График платежей",
            icon: "pi pi-fw pi-calendar",
            to: "/payments",
          },
        ],
      },
      {
        label: "Расписание",
        icon: "pi pi-fw pi-calendar",
        items: [
          {
            label: "Нагрузка",
            icon: "pi pi-fw pi-calendar-times",
            to: "/ScheduleLoads",
          },
          { label: "Аудитории", icon: "pi pi-fw pi-building", to: "/audits" },
        ],
      },
      {
        label: "Excel",
        icon: "pi pi-fw pi-file-excel",
        to: "/xlparse",
      },
      {
        label: "Админ панель",
        icon: "pi pi-fw pi-box",
        items: [
          {
            label: "Процедуры",
            icon: "pi pi-fw pi-list",
            to: "/procedures",
          },
          {
            label: "Функции",
            icon: "pi pi-fw pi-list",
            to: "/functions",
          },
          {
            label: "Роли",
            icon: "pi pi-fw pi-list",
            to: "/roles",
          },
          {
            label: "Пользователи",
            icon: "pi pi-fw pi-list",
            to: "/users",
          },
          {
            label: "Триггеры",
            icon: "pi pi-fw pi-list",
            to: "/triggers",
          },
          {
            label: "Таблицы",
            icon: "pi pi-fw pi-list",
            to: "/tables",
          },
        ],
      },
      {
        label: "Журнал",
        icon: "pi pi-fw pi-file-book",
        to: "/teachers"
           
      },
      {
        label: "Настройки",
        icon: "pi pi-fw pi-cog",
        to: "/profile",
      },

      {
        label: "Выйти",
        icon: "pi pi-fw pi-sign-out",
        command: logOut, // Use the logOut function here
      },
    ],
  },
]);
</script>

<template>
  <ul class="layout-menu">
    <AppUserInfo></AppUserInfo>
    <Divider />
    <template v-for="(item, i) in model" :key="i">
      <app-menu-item
        v-if="!item.separator"
        :item="item"
        :index="i"
      ></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped>
/* Your styles here */
</style>
