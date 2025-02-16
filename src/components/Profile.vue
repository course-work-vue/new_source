<template>
  <div class="container">
    <header class="jumbotron">
      <h3>
        <strong>{{ currentUser.username }}</strong> Profile
      </h3>
    </header>
    <p>
      <strong>Token:</strong>
      {{ currentUser.accessToken }}
      {{ currentUser.accessToken.substring(0, 20) }} ...
      {{ currentUser.accessToken.substr(currentUser.accessToken.length - 20) }}
    </p>
    <p>
      <strong>Id:</strong>
      {{ currentUser.id }}
    </p>
    <strong>Роль:</strong>
    {{ currentUser.role }}
  </div>
</template>

<script>
import { useAuthStore } from "../store2/auth";
import { mapState, mapActions } from "pinia";
export default {
  name: "Profile",
  computed: {
    ...mapState(useAuthStore, ["user"]),
    currentUser() {
      return this.user;
    },
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push("/login");
    }
  },
};
</script>
