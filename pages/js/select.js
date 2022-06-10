function enableQuantity(id) {
    let x =document.getElementById(id)
    let y =x.querySelector('input.orderId')
    if(y.checked == true){
        x.querySelector('select.stat').removeAttribute("disabled");
        x.className = 'table-primary';
    }else if(y.checked == false){
        x.querySelector('select.stat').setAttribute("disabled", "disabled");
        x.removeAttribute('class');
   }
}