<script setup>
import { computed, watch, ref, onMounted } from "vue";
import AppTopbar from "./AppTopbar.vue";
import AppSidebar from "./AppSidebar.vue";
import { useAuthStore } from "../store2/auth";
import { useLayout } from "@/layout/composables/layout";
import AppLoadingMask from "@/components/base/AppLoadingMask.vue";
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import ToastService from '@/services/ToastService';

const toast = useToast();
const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const authStore = useAuthStore();
const outsideClickListener = ref(null);

onMounted(() => {
  // Инициализируем Toast сервис
  ToastService.setToast(toast);
});

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  } else {
    unbindOutsideClickListener();
  }
});

const containerClass = computed(() => {
  return {
    "layout-theme-light": layoutConfig.darkTheme.value === "light",
    "layout-theme-dark": layoutConfig.darkTheme.value === "dark",
    "layout-overlay": layoutConfig.menuMode.value === "overlay",
    "layout-static": layoutConfig.menuMode.value === "static",
    "layout-static-inactive":
      layoutState.staticMenuDesktopInactive.value &&
      layoutConfig.menuMode.value === "static",
    "layout-overlay-active": layoutState.overlayMenuActive.value,
    "layout-mobile-active": layoutState.staticMenuMobileActive.value,
    "p-ripple-disabled": layoutConfig.ripple.value === false,
  };
});
const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive.value = false;
        layoutState.staticMenuMobileActive.value = false;
        layoutState.menuHoverActive.value = false;
      }
    };
    document.addEventListener("click", outsideClickListener.value);
  }
};
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener("click", outsideClickListener);
    outsideClickListener.value = null;
  }
};
const isOutsideClicked = (event) => {
  const sidebarEl = document.querySelector(".layout-sidebar");
  const topbarEl = document.querySelector(".layout-menu-button");

  return !(
    sidebarEl.isSameNode(event.target) ||
    sidebarEl.contains(event.target) ||
    topbarEl.isSameNode(event.target) ||
    topbarEl.contains(event.target)
  );
};
</script>

<template>
  <Toast />
  <AppLoadingMask></AppLoadingMask>
  <div class="layout-wrapper" :class="containerClass">
    <app-topbar></app-topbar>
    <div class="layout-sidebar">
      <app-sidebar></app-sidebar>
    </div>
    <div class="layout-main-container">
      <div v-if="!authStore.noAccess" class="layout-main">
        <router-view></router-view>
      </div>
      <div v-else class="no-access">
        <h1>Нет доступа</h1>
        <p>У Вас нет прав для доступа к этому разделу.</p>
      </div>
    </div>
    <div class="layout-mask"></div>
  </div>
</template>
<style lang="scss" scoped>
.no-access {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  color: red;
  p {
    color: gray;
  }
}
.app-layout {
  visibility: visible !important;
}
</style>
