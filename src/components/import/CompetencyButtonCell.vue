<template>
  <button class="btn btn-primary btn-sm w-100 h-100 d-flex align-items-center justify-content-center text-white p-0">
    <i class="material-icons-outlined" style="font-size: 18px;"></i>
    <span class="ms-1 d-none d-md-inline">Компетенции</span>
  </button>
</template>

<script>
export default {
  name: 'CompetencyButtonCell',
}
</script>

<style lang="scss" scoped>
.btn-primary {
    --bs-btn-bg: rgb(68,99,52);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
    --bs-btn-active-bg: rgb(68,99,52);
    --bs-btn-disabled-bg: rgb(68,99,52);
}

/* Убираем рамку фокуса, которую ag-grid иногда добавляет */
.btn:focus {
  box-shadow: none;
}
</style>