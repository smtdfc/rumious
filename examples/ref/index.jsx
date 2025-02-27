import { RumiousApp, RumiousComponent } from 'rumious';

// Define a custom component by extending RumiousComponent  
class MyComponent extends RumiousComponent {
  // Tag for debugging purposes (not required)  
  static tag = "my-component";
  
  // Called when the component is created  
  onCreate() {
    this.count = 0; // Initialize count  
  }
  
  // Event handler for button click  
  onClick() {
    this.count++; // Increment count  
    this.refs.element.textContent = this.count; // Update the displayed value  
  }
  
  // Define the component's UI  
  template() {
    return (
      <>  
        <div>  
          Current:  
          <span ref="element">0</span> {/* Reference to update later */}  
        </div>  
        <button on:click="onClick">Increase</button> {/* Button to trigger count update */}  
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