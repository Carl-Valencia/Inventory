function addFields(){
    var field = document.getElementById("field");

        var tr = document.createElement("tr");
        tr.setAttribute("id", "newRow");
        field.appendChild(tr);

        var td1 = document.createElement("td");
        tr.appendChild(td1);
        var input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("class", "pcode-input fs-5");
        input.setAttribute("name", "code");
        td1.appendChild(input);

        var td2 = document.createElement("td");
        tr.appendChild(td2);
        var input2 = document.createElement("input");
        input2.setAttribute("type", "text");
        input2.setAttribute("class", "pname-input fs-5");
        input2.setAttribute("name", "product");
        td2.appendChild(input2);

        var td5 = document.createElement("td");
        tr.appendChild(td5);
        var input5 = document.createElement("input");
        input5.setAttribute("type", "text");
        input5.setAttribute("list","unit")
        input5.setAttribute("class", "punit-input fs-5");
        input5.setAttribute("style","width: 5rem;");
        input5.setAttribute("name", "ut");
        var datalist = document.createElement("datalist");
        datalist.setAttribute("id","unit");
        td5.appendChild(input5, datalist);

        var td3 = document.createElement("td");
        tr.appendChild(td3);
        var input3 = document.createElement("input");
        input3.setAttribute("type", "number");
        input3.setAttribute("class", "punit-input fs-5");
        input3.setAttribute("name", "unit");
        input3.setAttribute("step", ".01");
        td3.appendChild(input3);

        var td4 = document.createElement("td");
        tr.appendChild(td4);
        var input4 = document.createElement("input");
        input4.setAttribute("type", "number");
        input4.setAttribute("class", "fs-5");
        input4.setAttribute("style", "width: 12rem")
        input4.setAttribute("name", "quantity");
        td4.appendChild(input4);

        var td6 = document.createElement("td");
        tr.appendChild(td6);
        var input6 = document.createElement("input");
        input6.setAttribute("type", "text");
        input6.setAttribute("class", "pcode-input fs-5");
        input6.setAttribute("name", "supplier");
        td6.appendChild(input6);
}