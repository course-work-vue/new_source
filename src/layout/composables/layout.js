import { toRefs, reactive, computed } from 'vue';

const layoutConfig = reactive({
    ripple: true,
    darkTheme: false,
    inputStyle: 'outlined',
    menuMode: 'static',
    theme: 'mdc-light-indigo',
    scale: 14,
    activeMenuItem: null
});

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    overlayMenuActive: true,
    profileSidebarVisible: true,
    staticMenuMobileActive: false,
    menuHoverActive: true
});

export function useLayout() {
    const setScale = (scale) => {
        layoutConfig.scale = scale;
    };

    const setActiveMenuItem = (item) => {
        layoutConfig.activeMenuItem = item.value || item;
    };

    const onMenuToggle = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        layoutState.staticMenuDesktopInactive = false;
        //to:do fix
        // if (window.innerWidth > 991) {
        //     layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        // } else {
        //     layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        // }
    };

    // const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive);
    const isSidebarActive = computed(() => true);
    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    return { layoutConfig: toRefs(layoutConfig), layoutState: toRefs(layoutState), setScale, onMenuToggle, isSidebarActive, isDarkTheme, setActiveMenuItem };
}
