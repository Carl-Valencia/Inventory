function search() {
    // Declare variables
    var input, filter, body, tr, td, th, i, txtValue, txtValue2;
    input = document.getElementById("inStocksList");
    filter = input.value.toUpperCase();
    body = document.getElementById("stocksListBody");
    tr = body.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      th = tr[i].getElementsByTagName("td")[1];
      td = tr[i].getElementsByTagName("td")[0];
      if (th || td) {
        txtValue = th.innerHTML || th.innerText;
        txtValue2 = td.innerHTML || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }