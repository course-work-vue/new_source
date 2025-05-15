<template>
    <div class="selectorcard" :key="rows">
      <div class="card border border-success bg-white">
        <div>
          <b>{{ title }}</b>
        </div>
        <div>
            {{ info }}
            <div class="" v-for="row in this.info" :key="row">
                {{ row }}
            </div>
        </div>
      </div>
    </div>
</template>
  
<script>
export default {
  props: {
    title: String,
    rows: Array
  },
  data() {
    return {
        type: '',
        info: []
    }
  },

  updated(){
    console.log('zzz', this.type);
    if (this.type == 'group'){
            this.info = [...new Set(rows.map(group => group.group_id, group.group_number))];
            console.log(this.info);
    }
  },

    created(){
        console.log('ccc');
        
        // if (type == 'group'){
        //     this.info = [...new Set(rows.map(group => group.group_id, group.group_number))];
        //     console.log(this.info);
            
        // }
    }
}

</script>
<style lang="scss" scoped>
    
</style>