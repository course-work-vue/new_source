<template>
  <DocumentEditor
    id="docEditor"
    documentServerUrl="https://ncatbird.ru:8855/"
    :config="config"
    :events_onDocumentReady="onDocumentReady"
    :onLoadComponentError="onLoadComponentError"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { DocumentEditor } from "@onlyoffice/document-editor-vue";

export default defineComponent({
  name: "ExampleComponent",
  components: {
    DocumentEditor,
  },
  data() {
    return {
      loading: true, // Loading state
      config: {
        document: {
          fileType: "docx",
          title: "Example Document Title.docx",
          url: "https://ncatbird.ru/doc.docx",
        },
        documentType: "word",
        editorConfig: {
          lang: "ru",
        },
      },
    };
  },

  methods: {
    onDocumentReady() {
      console.log("Document is loaded");
      this.loading = false; // Hide the loading bar and show the document
    },
    onLoadComponentError(errorCode, errorDescription) {
      switch (errorCode) {
        case -1: // Unknown error loading component
          console.log(errorDescription);
          break;

        case -2: // Error load DocsAPI from http://documentserver/
          console.log(errorDescription);
          break;

        case -3: // DocsAPI is not defined
          console.log(errorDescription);
          break;
      }
    },
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
