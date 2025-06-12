<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-links">
        <a href="#" class="footer-link">About</a>
        <a href="#" class="footer-link">Help</a>
     <a href="#" class="footer-link">Contact</a>
      </div>
      
      <div class="footer-copyright">
        &copy; InstaApp
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue'


</script>

<style scoped>
.footer {
  margin-top: 40px;
  padding: 20px 0;
  border-top: 1px solid #dbdbdb;
  background-color: #fafafa;
}

.footer-container {
  max-width: 935px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 12px;
}

.footer-link {
  color: #8e8e8e;
  text-decoration: none;
  margin: 0 10px;
  font-size: 12px;
}

.footer-copyright {
  color: #8e8e8e;
  font-size: 12px;
}

@media (max-width: 480px) {
  .footer-link {
    margin: 0 5px;
  }
}
</style>
