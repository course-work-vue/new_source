<template>
  <div class="h-full">
    <DocumentEditor
      id="docEditor"
      documentServerUrl="https://ncatbird.ru:8855/"
      :config="config"
      :events_onDocumentReady="onDocumentReady"
      :onLoadComponentError="onLoadComponentError"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { DocumentEditor } from "@onlyoffice/document-editor-vue";

export default defineComponent({
  name: "OnlyDocumentEditor",
  components: {
    DocumentEditor,
  },
  props: {
    documentUrl: {
      type: String,
      required: true,
    },
    documentTitle: {
      type: String,
      required: true,
    },
    // Новый проп для выбора типа документа (например, "excel" или "doc")
    objectType: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    // Вычисляем конфигурацию в зависимости от значения objectType
    const config = computed(() => {
      if (props.objectType === "excel") {
        return {
          document: {
            fileType: "xlsx",
            title: props.documentTitle,
            url: props.documentUrl,
          },
          documentType: "cell",
          editorConfig: {
            lang: "ru",
          },
        };
      }
      // По умолчанию (например, для Word)
      return {
        document: {
          fileType: "docx",
          title: props.documentTitle,
          url: props.documentUrl,
        },
        documentType: "word",
        editorConfig: {
          lang: "ru",
        },
      };
    });

    // Обработчик события загрузки документа
    const onDocumentReady = () => {
      console.log("Document is loaded");
    };

    // Обработчик ошибок загрузки компонента
    const onLoadComponentError = (
      errorCode: number,
      errorDescription: string
    ) => {
      switch (errorCode) {
        case -1:
        case -2:
        case -3:
          console.log(errorDescription);
          break;
        default:
          console.log("Unknown error", errorDescription);
      }
    };

    return {
      config,
      onDocumentReady,
      onLoadComponentError,
    };
  },
  // Очистка при переходе с маршрута
  beforeRouteLeave(to, from, next) {
    const editorElement = document.getElementById("docEditor");
    if (editorElement) {
      editorElement.innerHTML = "";
    }
    next();
  },
  // Очистка при размонтировании компонента
  beforeUnmount() {
    const editorElement = document.getElementById("docEditor");
    if (editorElement) {
      editorElement.innerHTML = "";
    }
  },
});
</script>

<style scoped>
.loading-bar {
  width: 100%;
  text-align: center;
  padding: 10px;
  background-color: #f0ad4e;
  color: white;
  font-weight: bold;
}
</style>
