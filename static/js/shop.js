var shopping = new Shopping();
function Shopping() {
    this.shoppingList = new ItemList();
    console.log("shoppingList created");
    this.purchaseList = new ItemList();
    console.log("purchaseList created");
}

Shopping.prototype.drawList = function($, list, listId) {
    var table = $("table." + listId);
    table.children("tbody").remove();
    table.append("<tbody />");
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        table
            .children("tbody")
            .append("<tr data-shoppingList-id=\"" + i + "\"/>")
            .children("tr:last")
            .append("<td>" + item["priority"] + "</td>")
            .append("<td>" + item["name"] + "</td>")
            .append("<td>$" + item["price"].toFixed(2) + "</td>")
            .append("<td>" + item["quantity"] + "</td>");
    }

}

Shopping.prototype.clearInputs = function($) {
    $itemInputs = $("td>input");
    for (i in $itemInputs.toArray()) {
        $itemInputs.eq(i).val("");
    }
}

Shopping.prototype.clearList = function($) {
    this.shoppingList.clearList();
    this.clearInputs($);
    this.drawList($, this.shoppingList.list, "shoppingList");
}

Shopping.prototype.addItem = function($) {
    var item;
    item = {
        "name" : $(".itemName>input").val(),
        "priority" : parseInt($(".itemPriority>input").val()),
        "price" : parseFloat($(".itemPrice>input").val().replace("$", "")),
        "quantity" : parseInt($(".itemQuantity>input").val())
    }
    try {
        this.shoppingList.addItem(item);
    }
    catch(err) {
        throw(err);
    }
    console.log("Added item: " + item.name);
    this.drawList($, this.shoppingList.list, "shoppingList");
    this.clearInputs($);
    $(".itemPriority>input").focus();
};

Shopping.prototype.removeItem = function(index) {
    this.shoppinglist.removeItem(index);
};

Shopping.prototype.shop = function($) {
    var shoppingList = this.shoppingList.list;
    var purchaseList = this.purchaseList.list;
    var budget = $(".budget>input").val;
    for (sListIndex = 0; sListIndex < shoppingList.list.length; sListIndex++) {
        var item = shoppingList[sListIndex];
        if (budget > item['price']) {
            pListIndex = purchaseList.addItem(item);
            purchaseItem = purchaseList[pListIndex];
            for (i = 1; i <= item['quantity']; i++) {
                if (budget < item['price']) {
                    break;
                }
                else {
                    budget = budget - item['price'];
                }
            }
            item['quantity'] = item['quantity'] - i;
            purchaseItem.setQuantity(i);
        }
    }
}
