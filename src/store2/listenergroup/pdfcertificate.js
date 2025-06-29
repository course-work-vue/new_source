import api from '@/api/api'; // Возвращаем ваш импорт
import { defineStore } from 'pinia';

export const usePdfCertificateStore = defineStore('pdfCertificate', {
  state: () => ({
    // Состояние остается таким же: храним один объект, а не список
    pdfFile: null, 
    isLoading: false,
    error: null,
  }),

  // Геттеры не обязательны, но можно оставить для удобства
  getters: {
    // Например, геттер для быстрого доступа к base64 строке
    fileData_base64(state) {
      return state.pdfFile ? state.pdfFile.pdf_base64 : null;
    }
  },

  actions: {
    async getPdfFile() {
      // Предотвращаем повторные запросы
      if (this.pdfFile) return;

      this.isLoading = true;
      this.error = null;
      console.log("Запрашиваю данные PDF-файла через api.js...");

      try {
        // ИСПОЛЬЗУЕМ ВАШ МЕТОД: await api.getPdfFile()
        const responseData = await api.getPdfFile();
        console.log("Ответ от api.getPdfFile():", responseData);

        if (responseData && responseData.length > 0) {
          this.pdfFile = responseData[0]; // Сохраняем объект {id, filename, pdf_base64}
        } else {
          this.pdfFile = null;
          console.warn("PDF-файл не найден в базе данных.");
        }
      } catch (e) {
        console.error("Ошибка при загрузке PDF-файла:", e);
        this.error = e;
        this.pdfFile = null;
      } finally {
        this.isLoading = false;
      }
    },
  },
});