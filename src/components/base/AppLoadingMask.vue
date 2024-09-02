<template>
  <Dialog
    v-model:visible="isLoading"
    modal
    :style="{ width: '25rem', boxShadow: 'none' }"
  >
    <template #container>
      <div class="align-items-center">
        <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
       
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="isCancelled"
    modal
    :style="{ width: '25rem', boxShadow: 'none' }"
  >
    <template #container>
      <Button class="col-12 my-4" @click="reload()">Попробовать ещё раз</Button>
    </template>
  </Dialog>
</template>

<script setup>
import { useLayoutStore } from "@/store2/layout";
import { computed } from "vue";
const layoutStore = useLayoutStore();

const isLoading = computed(() => {
  return layoutStore.isLoading;
});

const isCancelled = computed(() => {
  return layoutStore.cancelled;
});

const reload = () => {
  layoutStore.retryAbortedRequests();
};
</script>
