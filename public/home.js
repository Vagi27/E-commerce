
let main = document.getElementById("mainContainer");
let dialogbox = document.getElementById("dialogBox")

main.addEventListener("click", function () {
    dialogbox.open = false;
    let cartAdder = document.getElementById("cartAdder");
    cartAdder.innerText = "Add to cart";
})

// document.body.addEventListener("click", function () {

//     dialogbox.open = false;
// })

function crossfunc() {
    dialogbox.open = false;
    let cartAdder = document.getElementById("cartAdder");
    cartAdder.innerText = "Add to cart";


}

function profile(username) {
    // let request= new XMLHttpRequest();
    console.log(username);
    // request.send(JSON.stringify(event.target.innerText);
}

function loadmore() {
    let request = new XMLHttpRequest;
    request.open("get", "/loadmore");
    request.send()
    request.addEventListener("load", function () {
        console.log(request.responseText);
        if (request.responseText != "0") {
            let products = JSON.parse(request.responseText);
            console.log(products);
            let container = document.getElementById("productDivContain");
            if (products.length >= 1) {
                container.innerHTML = "";
                for (let i = 0; i < products.length; i++) {
                    let productdiv = document.createElement("div");
                    productdiv.setAttribute("class", "productDiv");

                    let img = document.createElement("img");
                    img.setAttribute("src", `products/${products[i].filename}`);
                    img.setAttribute("class", "productImage");
                    img.onclick = "getdetails(event)";

                    let div1 = document.createElement("div");
                    let span1 = document.createElement("span");
                    span1.setAttribute("class", "nameSpan");
                    span1.innerText = products[i].name;

                    let div2 = document.createElement("div");
                    div2.setAttribute("class", "prizeContainer");
                    let span2 = document.createElement("span");
                    span2.setAttribute("class", "prizeSpan");
                    span2.innerText = products[i].prize;
                    let button2 = document.createElement("button");
                    button2.setAttribute("class", "btn btn-primary");
                    button2.innerText = "View Details";
                    button2.addEventListener("click", getdetails);

                    div1.appendChild(span1);
                    div2.append(span2, button2);
                    productdiv.append(img, div1, div2);

                    container.appendChild(productdiv);
                }
            }

        }
        else {
            console.log("0 found");
            document.getElementById("loadmore").style["display"] = "none";
        }
    })

}

function getdetails(event) {
    let product;
    let path;
    if (event.target.parentNode.getAttribute("class") == "prizeContainer") {
        // console.log(event.target.parentNode.getAttribute("class"));
        path = event.target.parentNode.parentNode.children[0].getAttribute("src");
        path = path.slice(9);
        console.log(path);
    }
    else {
        path = event.target.src;
        path = path.slice(31);
        console.log(path);
    }

    let obj = {
        key: path
    }

    let request = new XMLHttpRequest();
    request.open("post", "/dialog");
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(obj));

    request.addEventListener("load", function () {
        product = JSON.parse(request.responseText);
        console.log(product);

        let dialogbox = document.getElementById("dialogBox")
        dialogbox.open = true;
        let dialogimg = document.getElementById("dialogImg");
        dialogimg.setAttribute("src", `products/${product.filename}`);

        let dialogname = document.getElementById("dialogName");
        dialogname.innerHTML = product.name;

        let dialogprize = document.getElementById("dialogPrize");
        dialogprize.innerHTML = "Rs. " + product.prize;

        let dialogdescription = document.getElementById("dialogDescription");
        dialogdescription.innerHTML = product.description;

        let cartAdder = document.getElementById("cartAdder");
        cartAdder.addEventListener("click", addtocart);
    })
}



function addtocart(event) {
    let element = document.getElementById("cartAdder");

    let imgfile = document.getElementById("dialogImg");
    let filename = imgfile.src.slice(31);
    console.log(filename);
    // product.quantity = 1;
    let request = new XMLHttpRequest();
    request.open("post", "/cart");
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify({ filename: filename }));
    // console.log(product);

    // console.log("in-function");
    request.addEventListener("load", function () {
        let data = request.responseText;
        console.log(data);
        if (data == "0") {
            element.innerText = "Already Added";
        }
        else {
            element.innerText = "Added";

        }
    })


}
