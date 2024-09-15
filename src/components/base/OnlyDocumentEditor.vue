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
import { defineComponent, onBeforeUnmount } from "vue";
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
  },
  data() {
    return {
      loading: true,
      config: {
        document: {
          fileType: "docx",
          title: "Example Document Title.docx",
          url: this.documentUrl, // Bind the prop here
        },
        documentType: "word",
        editorConfig: {
          lang: "ru",
        },
      },
    };
  },
  watch: {
    documentUrl(newUrl) {
      this.config.document.url = newUrl; // Update config when prop changes
    },
  },
  methods: {
    onDocumentReady() {
      console.log("Document is loaded");
      this.loading = false;
    },
    onLoadComponentError(errorCode, errorDescription) {
      switch (errorCode) {
        case -1:
          console.log(errorDescription);
          break;
        case -2:
          console.log(errorDescription);
          break;
        case -3:
          console.log(errorDescription);
          break;
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    // Clean up OnlyOffice Document Editor instance
    const editorElement = document.getElementById("docEditor");
    if (editorElement) {
      // Destroy the instance or perform necessary cleanup
      editorElement.innerHTML = ""; // Example cleanup
    }
    next();
  },
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
