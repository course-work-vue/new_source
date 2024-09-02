<template>
    <div class="popup-overlay">
      <div class="popup-content">
        <!-- Your form for adding a new student here -->
        <form @submit.prevent="addNewStudent">
          <!-- Input fields for student information -->
          <!-- For example: -->
          <input v-model="newStudent.firstName" placeholder="First Name">
          <input v-model="newStudent.lastName" placeholder="Last Name">
          <!-- Add more input fields as needed -->
  
          <button type="submit">Add Student</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        newStudent: {
          firstName: '',
          lastName: '',
          // Add more fields as needed
        }
      };
    },
    methods: {
      addNewStudent() {
        // Here you can add the logic to send the new student data to your backend
        // using API calls similar to what you're already doing in your component.
        // After successfully adding the student, you can close the popup.
        
        // Clear the form fields
        this.newStudent.firstName = '';
        this.newStudent.lastName = '';
  
        // Close the popup (you might need to emit an event to the parent component)
        // For example: this.$emit('close-popup');
      }
    }
  };
  </script>
  
  <style scoped>
  .popup-overlay {
    /* Styles for overlay background */
  }
  
  .popup-content {
    /* Styles for the popup content */
  }
  </style>