import { RumiousApp } from 'rumious';

// Create a new Rumious app and attach it to the element with id "root"  
const app = new RumiousApp(document.getElementById("root"));

// Render a simple heading inside the app  
app.render(
  <>  
    <h1>Hello Rumious</h1>  
  </>
);