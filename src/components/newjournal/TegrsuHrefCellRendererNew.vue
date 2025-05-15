<template>
    <router-link
      :to="{
        name: 'JournalListNew',
        params: { wl_id: params.data.wl_id }
      }"
      class="tegrsu-link"
    >
      {{ params.value }}
    </router-link>
  </template>
  
  <script>
  export default {
    name: 'TegrsuHrefCellRenderer',
    props: ['params'],
    mounted() {
        console.log('Render cell, params.data =', this.params.data);
  }
  };
  </script>
  
  <style scoped lang="scss">
  .tegrsu-link {
    text-decoration: underline;
    color: #181d1f;
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .tegrsu-link:hover {
    color: #126e2a;
    text-decoration: underline;
  }
  </style>