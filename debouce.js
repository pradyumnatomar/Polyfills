export function debouce(callback, wait, immediate){
  let timeout = null;
  return function(...args){
    const context = this;
    const shouldCallNow = immediate && !timeout
    clearTimeout(timeout)
    function later(){
      timeout = null
      if(!immediate) callback.apply(context, args)
    }
    setTimeout(later, wait)
    if(shouldCallNow) callback.apply(context, args)
  }
}
