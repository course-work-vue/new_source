<template>
  <div id="app">
    <!--
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <a href="/" class="navbar-brand">bezKoder</a>
      <div class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link to="/home" class="nav-link">
            <font-awesome-icon icon="home" /> Home
          </router-link>
        </li>
        <li v-if="showAdminBoard" class="nav-item">
          <router-link to="/admin" class="nav-link">Admin Board</router-link>
        </li>
        <li v-if="showModeratorBoard" class="nav-item">
          <router-link to="/mod" class="nav-link">Moderator Board</router-link>
        </li>
        <li class="nav-item">
          <router-link v-if="currentUser" to="/students" class="nav-link">User</router-link>
        </li>
      </div>

      <div v-if="!currentUser" class="navbar-nav ml-auto">
        <li class="nav-item">
          <router-link to="/register" class="nav-link">
            <font-awesome-icon icon="user-plus" /> Sign Up
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/login" class="nav-link">
            <font-awesome-icon icon="sign-in-alt" /> Login
          </router-link>
        </li>
      </div>

      <div v-if="currentUser" class="navbar-nav ml-auto">
        <li class="nav-item">
          <router-link to="/profile" class="nav-link">
            <font-awesome-icon icon="user" />
            {{ currentUser.username }}
          </router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" @click.prevent="logOut">
            <font-awesome-icon icon="sign-out-alt" /> LogOut
          </a>
        </li>
      </div>
    </nav>
-->
    <Toast />
    <div class="mycontainer">
      <router-view />
    </div>
  </div>
</template>

<script>
import Menu from "./components/Menu.vue";
import Toast from 'primevue/toast';

import { useAuthStore } from "./store2/auth";
import { mapState, mapActions } from "pinia";
export default {
  created() {
    this.checkTokenExpiration();
  },

  components: {
    Toast
  },
  computed: {
    ...mapState(useAuthStore, ["noAccess"]),
    /*
    showAdminBoard() {
      if (this.currentUser && this.currentUser['roles']) {
        return this.currentUser['roles'].includes('ROLE_ADMIN');
      }

      return false;
    },
    showModeratorBoard() {
      if (this.currentUser && this.currentUser['roles']) {
        return this.currentUser['roles'].includes('ROLE_MODERATOR');
      }

      return false;
    }
      */
  },

  methods: { ...mapActions(useAuthStore, ["checkTokenExpiration"]) },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Karla:wght@300;400&display=swap");
* {
  font-family: "Montserrat";
}

html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

html {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0;
  overflow: auto;
}

body {
  padding: 1rem;
  overflow: auto;
}

/* WebKit browsers */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}


</style>
