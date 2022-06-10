function calc(id){
    let x =document.getElementById(id);
    let y =x.querySelector('input.ch');
    if(y.checked == true){
        let price = x.querySelector("td.punit-input").innerHTML;
        let quantity = x.querySelector("input.quantity").value;
        x.querySelector('input.partial').value = price*quantity;
    }else if(y.checked == false){
    
   }
        
}