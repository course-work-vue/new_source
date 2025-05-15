class ToastService {
    toast = null;
    // Хранение последних уведомлений для debounce
    lastMessages = {};
    // Таймеры для debounce
    timers = {};
    // Время debounce в миллисекундах
    debounceTime = 3000;

    setToast(toastInstance) {
        this.toast = toastInstance;
    }

    _showToast(type, message, summary, life) {
        if (!this.toast) {
            console.error(`Toast не инициализирован (${type}):`, message);
            return;
        }

        // Создаем ключ для уведомления, сочетая тип и сообщение
        const messageKey = `${type}:${message}`;

        // Если такое же уведомление уже показывается и еще не истек таймер debounce
        if (this.lastMessages[messageKey]) {
            // Просто обновляем timestamp, не показываем новое уведомление
            clearTimeout(this.timers[messageKey]);
            this.timers[messageKey] = setTimeout(() => {
                delete this.lastMessages[messageKey];
                delete this.timers[messageKey];
            }, this.debounceTime);
            return;
        }

        // Показываем уведомление
        this.toast.add({
            severity: type,
            summary: summary,
            detail: message,
            life: life
        });

        // Запоминаем это сообщение
        this.lastMessages[messageKey] = true;
        
        // Устанавливаем таймер для удаления из списка последних сообщений
        this.timers[messageKey] = setTimeout(() => {
            delete this.lastMessages[messageKey];
            delete this.timers[messageKey];
        }, this.debounceTime);
    }

    showError(message) {
        this._showToast('error', message || 'Произошла ошибка при выполнении запроса', 'Ошибка', 5000);
    }

    showSuccess(message) {
        this._showToast('success', message, 'Успешно', 3000);
    }

    showInfo(message) {
        this._showToast('info', message, 'Информация', 3000);
    }

    showWarn(message) {
        this._showToast('warn', message, 'Предупреждение', 4000);
    }
    
    // Очистка всех уведомлений
    clearAll() {
        if (this.toast && this.toast.removeAllGroups) {
            this.toast.removeAllGroups();
        }
        // Очищаем все таймеры и данные последних сообщений
        Object.keys(this.timers).forEach(key => {
            clearTimeout(this.timers[key]);
        });
        this.lastMessages = {};
        this.timers = {};
    }
}

export default new ToastService(); 