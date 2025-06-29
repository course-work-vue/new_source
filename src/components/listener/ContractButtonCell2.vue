<template>
  <div class="krasivsk">
    <button @click="downloadPdf" class="btn btn-primary btn-sm">
      <i class="material-icons-outlined"></i> Сертификат
    </button>
  </div>
</template>

<script setup>
import { defineProps, toRaw } from 'vue';
import { usePdfCertificateStore } from "@/store2/listenergroup/pdfcertificate";

const props = defineProps({
  params: { type: Object, required: true }
});
const store = usePdfCertificateStore();

function onClick() {
  // Берём id прямо из данных строки
  const id = toRaw(props.params.data).id;
  if (!id) return;
  // Скачиваем
  store.getCertificate(id);
}
</script>

  

<style lang="scss" scoped>


.krasivsk{
  height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-primary{
    --bs-btn-bg: rgb(68,99,52);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
    --bs-btn-active-bg: rgb(68,99,52);
    --bs-btn-disabled-bg: rgb(68,99,52);
    display: flex;
  justify-content: center;
  align-items: center;
}
.form-control:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
}
.form-select:focus {
  border-color: rgba(1, 20, 8, 0.815);
  box-shadow: inset 0 1px 1px rgba(6, 215, 29, 0.075), 0 0 8px rgba(6, 215, 29, 0.6);
}
.page-link{
  height: 40px;
  width: 40px;
  margin: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.active{
  .page-link{
    background-color: rgb(68,99,52);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
 
  }
}
.disabled{
  .page-link{
    background-color: rgb(57, 79, 46);
    border: none;
    --bs-btn-hover-bg:rgb(6 215 29);
    --bs-btn-hover-border-color: rgb(6 215 29);
  }
}
</style>