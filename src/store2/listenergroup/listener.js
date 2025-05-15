import api from '@/api/api';
import Listener from '@/model/listener-group/Listener';
import { defineStore } from 'pinia';

export const useListenerStore = defineStore('listener', {
    state: () => ({
        listenerList: [],
        ready_listenerList: [],
    }),
    getters: {
        listenerMap(state) {
            return state.listenerList.reduce((map, listener) => {
                map[listener.id] = listener;
                return map;
            }, {});
        },
    },
    actions: {
        async getListenerList() {
            const responseData = await api.getListenerList();
            this.listenerList = responseData.map((listener) => {
                return new Listener(listener);
            });
        },

        async getReady_ListenerList() {
            const responseData = await api.getReady_ListenerList();
            this.ready_listenerList = responseData.map((ready_listener) => {
                return new Listener(ready_listener);
            });
        },

        async getListener(code) {
            await api.getListener(code);
        },

        async postListener(listener) {
            console.log(listener);
            const response = await api.postListener(listener);
            console.log(response)
            if (response.success === true) {

                await this.getListenerList();
            }
        },

        async putListener(listener) {
            const response = await api.putListener(listener.id, listener);
            console.log(response)
            if (response.success === true) {
                const index = this.listenerList.findIndex(s => s.id === listener.id);
                if (index !== -1) {
                    this.listenerList.splice(index, 1, new Listener(listener));
                }
            }
        },

        async deleteListener(listener) {
            const response = await api.deleteListener(listener);
            if (response.success === true) {
                const index = this.listenerList.findIndex(s => s.id === listener.id);
                if (index !== -1) {
                    this.listenerList[index].deleted_at = new Date().toISOString();
                }
            }
        },

        async postListenersGroup(listenersGroup) {
  const response = await api.postListenersGroup(listenersGroup);
  console.log(response);
  if (response.success === true) {
    await this.getListenersGroupList?.(); // если метод есть
  }
},

async deleteListenersGroup(listenersGroup) {
  const response = await api.deleteListenersGroup(listenersGroup);
  if (response.success === true) {
    const index = this.listenersGroupList.findIndex(s =>
      s.listener_id === listenersGroup.listener_id &&
      s.l_group_id === listenersGroup.l_group_id
    );
    if (index !== -1) {
      this.listenersGroupList[index].deleted_at = new Date().toISOString();
    }
  }
},


        async syncGroupListeners(groupId, finalListenerIdsSet, originalListenerIdsSet) {
  console.log(`[ListenerStore.syncGroupListeners] === НАЧАЛО СИНХРОНИЗАЦИИ СЛУШАТЕЛЕЙ ДЛЯ ГРУППЫ ID: ${groupId} ===`);

  if (!this.listenerList || this.listenerList.length === 0) {
    console.warn('[ListenerStore.syncGroupListeners] listenerList пуст или не загружен. Попытка загрузить...');
    await this.getListenerList?.(); // если метод есть
  }

  const listenerDeletionStatusMap = new Map(
    this.listenerList.map(listener => [listener.id, listener.deleted_at !== null])
  );

  const originalListenersArray = Array.from(originalListenerIdsSet);
  const finalListenersArray = Array.from(finalListenerIdsSet);

  console.log('[ListenerStore.syncGroupListeners] ИСХОДНЫЕ слушатели в группе (ID):', JSON.parse(JSON.stringify(originalListenersArray)));
  console.log('[ListenerStore.syncGroupListeners] ФИНАЛЬНЫЕ слушатели в группе (ID по UI):', JSON.parse(JSON.stringify(finalListenersArray)));

  const listenersToAddIds = finalListenersArray.filter(id => {
    const isNew = !originalListenerIdsSet.has(id);
    const isDeleted = listenerDeletionStatusMap.get(id) === true;
    if (isNew && isDeleted) {
      console.log(`[ListenerStore.syncGroupListeners] Пропуск добавления УДАЛЕННОГО слушателя ID ${id} в группу ${groupId}.`);
    }
    return isNew && !isDeleted;
  });

  const listenersToRemoveIds = originalListenersArray.filter(id => {
    return !finalListenerIdsSet.has(id);
  });

  console.log('[ListenerStore.syncGroupListeners] Слушатели к ДОБАВЛЕНИЮ в группу (ID, только не удаленные):', JSON.parse(JSON.stringify(listenersToAddIds)));
  console.log('[ListenerStore.syncGroupListeners] Слушатели к УДАЛЕНИЮ из группы (ID):', JSON.parse(JSON.stringify(listenersToRemoveIds)));

  for (const listenerId of listenersToAddIds) {
    const listenersGroup = {
      listener_id: listenerId,
      l_group_id: groupId,
      join_date: new Date().toISOString().split('T')[0] 
    };
    try {
      await this.postListenersGroup(listenersGroup);
      console.log(`[syncGroupListeners] Добавлен listener_id=${listenerId} в group_id=${groupId}`);
    } catch (error) {
      console.error(`[syncGroupListeners] Ошибка при добавлении listener_id=${listenerId}:`, error);
    }
  }

  for (const listenerId of listenersToRemoveIds) {
    const listenersGroup = {
      listener_id: listenerId,
      l_group_id: groupId
    };
    try {
      await this.deleteListenersGroup(listenersGroup);
      console.log(`[syncGroupListeners] Удалён listener_id=${listenerId} из group_id=${groupId}`);
    } catch (error) {
      console.error(`[syncGroupListeners] Ошибка при удалении listener_id=${listenerId}:`, error);
    }
  }

  console.log(`[ListenerStore.syncGroupListeners] === КОНЕЦ СИНХРОНИЗАЦИИ СЛУШАТЕЛЕЙ ДЛЯ ГРУППЫ ID: ${groupId} ===`);
}

  },
});
