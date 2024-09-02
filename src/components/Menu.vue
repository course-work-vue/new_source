<template>
    <div class="menu" :class="{ 'small-menu': smallMenu }">
      <MenuItem
        v-for="(item, index) in menuTree"
        :key="index"
        :data="item.children"
        :label="item.label"
        :link="item.link"
        :icon="item.icon"
        :depth="0"
        :smallMenu="smallMenu"
        @click.prevent="index === menuTree.length - 1 ? logOut() : null"
        :class="{ 'bottom-fixed': index === menuTree.length - 1 }"
      />


    </div>
  </template>
  
  <script>
  import MenuItem from './MenuItem.vue';
  
  export default {
    name: 'recursive-menu',
    data: () => ({
      smallMenu: false,
      menuTree: [
        {
          label: "Домой",
          link: "/home",
          icon: "home",
        },
        {
          label: "Студенты",
          link: "",
          icon: "school",
          children: [
            {
              label: "Список студентов",
              link: "/students",
            },
            {
              label: "Направления",
              link: "/directions",
            },
            {
              label: "Профили",
              link: "/profiles",
            },
            {
              label: "Группы",
              link: "/groups",
            },
            {
              label: "Курсовые",
              link: "/courseworks",
            },
      
            
          ]
        },
        {
          label: "Слушатели",
          link: "",
          icon: "contact_page",
          children: [
          {
              label: "Список слушателей",
              link: "/listeners",
            },
            {
              label: "Плательщики",
              link: "/payers",
            },
            {
              label: "Группы",
              link: "/lgroups",
            },
            {
              label: "Договора",
              link: "/contracts",
            },
            {
              label: "Программы",
              link: "/programs",
            },
            {
              label: "График платежей",
              link: "/payments",
            },
            
            

          ]
        },
        {
          label: "Расписание",
          link: "",
          icon: "calendar_month",
          children: [
            {
              label: "Нагрузка",
              link: "/ScheduleLoads",
            },
            {
              label: "Аудитории",
              link: "/audits",
            }
          ]
        },
          {
          label: "Excel",
          link: "/xlparse",
          icon: "description"
        },
        {
          label: "Настройки",
          link: "/profile",
          icon: "settings"
        },
        {
          label: "Выйти",
          link: "",
          icon: "logout"
      },
      ]
    }),
    components: {
      MenuItem
    },
    methods:{
      logOut() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/login');
    },
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .menu {
    background-color: white;
    z-index: 9999;
    position: fixed;
    height: 100vh;
    width: 240px;
    left: 0;
    top: 0;
    border-right: 1px solid #ececec;
    transition: all .3s ease;
    overflow: auto;
    i {
      position: fixed;
      left: 250px;
      font-size: 40px;
      top: 15px;
      user-select: none;
      cursor: pointer;
      transition: all .3s ease;
    }
    &.small-menu {
      overflow: inherit;
      width: 120px;
      padding-top: 50px;
      i {
        left: 20px;
      }
    }
  }

  .bottom-fixed{
    position: absolute; /* Use absolute positioning */
  bottom: 0; /* Place it at the bottom of the parent container */
 
  /* Add any other styles you want for the bottom-fixed item */
  }
  </style>
