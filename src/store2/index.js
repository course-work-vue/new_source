
import { useAuthStore } from '@/store2/auth';
import { useLayoutStore } from '@/store2/layout';
import std from '@/store2/studentgroup'
export default {
    ...std,
    useAuthStore,
    useLayoutStore,
};
