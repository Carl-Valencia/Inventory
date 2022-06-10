function search() {
    // Declare variables
    var input, filter, body, tr, td, th, i, txtValue, txtValue2;
    input = document.getElementById("orderIdList");
    filter = input.value.toUpperCase();
    body = document.getElementById("tbody");
    tr = body.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      th = tr[i].getElementsByTagName("th")[0];
      td = tr[i].getElementsByTagName("th")[5];
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