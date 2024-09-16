<template>
  <div class="container">
    <p>
      <input type="file" @change="onFileChange" style="margin-left: 15vh;margin-top: 10vh;">
    </p>
    
  </div>
</template>

<script>

import readXlsxFile from 'read-excel-file'
import { readSheetNames } from 'read-excel-file';

import UserService from "../services/user.service";

export default {
  name: 'Profile',
  data() {
    return {
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login');
    }
  },
  methods: {

    onFileChange(event) {

    let xlsxfile = event.target.files ? event.target.files[0] : null;       // самый старт
    
    //console.log(xlsxfile)

    const p = new Promise(function(resolve) {
      readSheetNames(xlsxfile).then((sheetNames) => {
        for(let i = 0;i<sheetNames.length;i++) {
          //fix исправить все false на true
        }
      })
    })

    p.then(() => {

    })
  },
}
}
</script>