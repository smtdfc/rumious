export function createOrGetData(element,data={}){
  if(!element._rumiousui) element._rumiousui = data;
  return element._rumiousui;
}

