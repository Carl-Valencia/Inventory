new Date().getFullYear();
document.getElementById("Year").value = new Date().getFullYear();
document.getElementsByName("Year")[0].placeholder = new Date().getFullYear();

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var m = new Date();
document.getElementById("Month").value = m.getMonth()+1;
document.getElementById("currentMonth").innerHTML = monthNames[m.getMonth()];
document.getElementsByName("Month")[0].placeholder = monthNames[m.getMonth()];

new Date().getDate();
document.getElementById("Day").value = new Date().getDate();
document.getElementsByName("Day")[0].placeholder = new Date().getDate();

let days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
21,22,23,24,25,26,27,28,29,30,31];
let list = document.getElementById('dayIdOptions');

days.forEach(function(item){
  let option = document.createElement('option');
  option.value = item;
  list.appendChild(option);
});

let months = [1,2,3,4,5,6,7,8,9,10,11,12];
let list2 = document.getElementById('monthIdOptions');

months.forEach(function(item){
  let option2 = document.createElement('option');
  option2.value = item;
  option2.innerHTML = monthNames[item-1];
  list2.appendChild(option2);
});

let years = [2021,2022,2023,2024,2025,2026,2027,2028,2029,2030];
let list3 = document.getElementById('yearIdOptions');

years.forEach(function(item){
  let option3 = document.createElement('option');
  option3.value = item;
  list3.appendChild(option3);
});