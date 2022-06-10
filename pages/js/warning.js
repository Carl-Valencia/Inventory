window.onload = function warning() {
    let u = document.getElementById('tbody')
    console.log(u)
    let x = u.getElementsByClassName('uniquerow')
    console.log(x, x.length)
    for (let i = 0; i < x.length; i++) {
        let z = document.getElementById(x.item(i).id)
        let y = z.querySelector('input.stocks').value
        if(y <= 30){
            z.className = 'uniquerow table-danger';
            z.querySelector('span.tag').innerHTML += ' * ';
        }else{
            z.className = 'uniquerow ';
            z.querySelector('span.tag').innerHTML += ' ';
        }
     }
    
}