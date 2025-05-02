<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "../store2/auth";
import { useRouter } from "vue-router";

import AppMenuItem from "./AppMenuItem.vue";
import AppUserInfo from "@/components/base/AppUserInfo.vue";

const authStore = useAuthStore();
const router = useRouter();

// Функция для выхода из системы
const logOut = () => {
  authStore.logout();
  router.push("/login");
};

// Исходная модель меню с добавленным свойством roles для ограниченных маршрутов
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
          { label: "Квал. работы", icon: "pi pi-fw pi-book", to: "/courseworks" },
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
          { label: "Договоры", icon: "pi pi-fw pi-file", to: "/contracts" },
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
          { label: "Расписание", icon: "pi pi-fw pi-calendar", to: "/schedules" },
          { label: "Аудитории", icon: "pi pi-fw pi-building", to: "/audits" },
        ],
      },
      {
        label: "Импорт данных",
        icon: "pi pi-fw pi-file-excel",
        to: "/import",
      },
      {
        label: "Админ панель",
        icon: "pi pi-fw pi-box",
        roles: ["super_admin", 'superadmin'], // Этот маршрут доступен только для админа
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
        icon: "pi pi-fw pi-book",
        to: "/teachers",
      },
      {
        label: "Настройки",
        icon: "pi pi-fw pi-cog",
        to: "/profile",
      },
      {
        label: "Выйти",
        icon: "pi pi-fw pi-sign-out",
        command: logOut,
      },
    ],
  },
]);

// Рекурсивная функция для фильтрации пунктов меню по ролям
const filterMenuItems = (items) => {
  if (!authStore.user) {
    return [];
  }
  return items.reduce((filtered, item) => {
    // Если указан массив roles, проверяем, есть ли хотя бы одна роль пользователя
    if (item.roles && Array.isArray(item.roles)) {
      const hasRole = authStore.user.roles.some((role) =>
        item.roles.includes(role)
      );
      if (!hasRole) {
        return filtered; // Пропускаем этот пункт, если ролей не хватает
      }
    }
    // Если есть вложенные пункты, фильтруем их рекурсивно
    const newItem = { ...item };
    if (newItem.items) {
      newItem.items = filterMenuItems(newItem.items);
    }
    filtered.push(newItem);
    return filtered;
  }, []);
};

// Вычисляемое свойство для отфильтрованной модели меню
const filteredModel = computed(() => {
  return model.value.map((group) => ({
    ...group,
    items: filterMenuItems(group.items),
  }));
});
</script>

<template>
  <ul class="layout-menu">
    <AppUserInfo />
    <Divider />
    <template v-for="(item, i) in filteredModel" :key="i">
      <app-menu-item v-if="!item.separator" :item="item" :index="i" />
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped>
/* Ваши стили */
</style>
