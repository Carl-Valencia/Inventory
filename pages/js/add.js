function totalPrice(){
    var elems = document.getElementsByClassName('partial');

    var myLength = elems.length,
    total = 0;
    
    for (var i = 0; i < myLength; ++i) {
        if(parseFloat(elems[i].value)){
            total += parseFloat(elems[i].value);
        }
    }
    
    document.getElementById('total').innerHTML = total;
}