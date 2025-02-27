import { RumiousApp, RumiousComponent } from 'rumious';

// Define a custom component by extending RumiousComponent  
class MyComponent extends RumiousComponent {
  // Tag for debugging purposes (not required)  
  static tag = "my-component";
  
  // Event handler for button click  
  onClick() {
    alert("Hello");
  }
  
  // Define the component's UI  
  template() {
    return (
      <>  
        <h1>This is a component</h1>  
        <button on:click="onClick">Click here</button>  
      </>
    );
  }
}

// Create a Rumious app and attach it to the element with id "root"  
const app = new RumiousApp(document.getElementById("root"));

// Render the component into the app  
app.render(
  <>  
    <MyComponent />  
  </>
);