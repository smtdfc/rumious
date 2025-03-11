import {generateId} from './utils/key.js';
import {RumiousUIToast} from './components/index.js';

export class ToastGenerator{
  static containerID = `rumiousui_${generateId()}`
  ensureContainer(){
    let element = document.getElementById(ToastGenerator.containerID);
    if(!element){
      element = document.createElement('div');
      element.setAttribute('id',ToastGenerator.containerID);
      document.body.appendChild(element);
    }
  }
  
  show(message, options={}){
    let toast = RumiousUIToast.create(
      message,
      options.type ?? 'primary'
    );
    
    toast.show();
    setTimeout(()=>{
      toast.close()
    },options.duration ?? 500)
  }
}