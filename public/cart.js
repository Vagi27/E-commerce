function quantitymanipulator(event) {
    console.log(event.target.innerText);
    console.log(event.target.id);
    let sign = event.target.innerText;

    let request = new XMLHttpRequest();
    request.open("post", "/cart");
    request.setRequestHeader("Content-Type", "application/json");

    request.send(JSON.stringify({ sign: sign, filename: event.target.id }));

    request.addEventListener("load", function () {
        console.log(request.responseText);
        let product = JSON.parse(request.responseText);
        if (product.quantity == 0) {
            document.getElementById("par" + product.filename).remove();
        }
        else {
            document.getElementById("q" + product.filename).innerText = product.quantity;
            document.getElementById("p" + product.filename).innerText = "₹ " + product.quantity * product.prize.slice(1);
        }
    });
}