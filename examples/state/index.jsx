import { RumiousApp, RumiousComponent, createState } from 'rumious';

// Define a custom component by extending RumiousComponent  
class MyComponent extends RumiousComponent {
  // Tag for debugging purposes (not required)  
  static tag = "my-component";
  
  // Called when the component is created  
  onCreate() {
    this.value = createState(); // Initialize a reactive state  
  }
  
  // Event handler for button click  
  onClick() {
    this.value.produce(value => value + 1); // Increment the state value  
  }
  
  // Define the component's UI  
  template() {
    return (
      <>  
        <div>  
          Current:  
          <span bind:text="value">0</span> {/* Automatically updates when value changes */}  
        </div>  
        <button on:click="onClick">Increase</button> {/* Button to increment value */}  
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