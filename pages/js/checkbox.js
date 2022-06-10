function enableQuantity(id) {
    let x =document.getElementById(id)
    let y =x.querySelector('input.ch')
    if(y.checked == true){
        x.querySelector('input.quantity').removeAttribute("disabled");
        x.querySelector('input.partial').removeAttribute("disabled");
        x.querySelector('input.status').removeAttribute("disabled");
        x.className = 'table-primary';
        x.querySelector('span.tag').innerHTML += ' * ';
    }else if(y.checked == false){
        x.querySelector('input.quantity').setAttribute("disabled", "disabled");
        x.querySelector('input.partial').setAttribute("disabled", "disabled");
        x.querySelector('input.status').setAttribute("disabled", "disabled");
        x.removeAttribute('class');
        x.querySelector('span.tag').innerHTML = ' ';
   }
}