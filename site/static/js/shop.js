var shopping = new Shopping();
function Shopping() {
    this.shoppingList = new ItemList();
    console.log("shoppingList created");
    this.purchaseList = new ItemList();
    console.log("purchaseList created");
    this.shoppingLists = indexedDB.open("shoppingLists", 1);
    this.db = undefined;
    this.lists = indexedDB.open("lists", 1);
    this.lists.onupgradeneeded = function(e) {
        var listDB = e.target.result;
        console.log("running onupgradeneeded for lists");
        if(!listDB.objectStoreNames.contains("shoppingLists")) {
            console.log("making object store for shoppingLists");
            listDB.createdObjectStore("shoppingLists", {keyPath:"id", autoIncrement: true});
        }
        if(!listDB.objectStoreNames.contains("purchaseLists")) {
            console.log("making object store for purchaseLists");
            listDB.createdObjectStore("purchaseLists", {keyPath:"id", autoIncrement: true});
        }
    }
    this.lists.onsuccess = function(e) {
        console.log("running onsuccess");
        this.db = e.target.result;
        console.dir(this.db.objectStoreNames);
    }

    this.lists.onerror = function(e) {
        console.log("onerror!");
        console.dir(e);
    }
}

Shopping.prototype.drawList = function($, list, listId) {
    var table = $("table#" + listId);
    table.children("tbody").remove();
    table.append("<tbody />");
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        table
            .children("tbody")
            .append("<tr data-shoppingItem-id=\"" + i + "\"/>")
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

Shopping.prototype.clearList = function($, id) {
    if (id == "purchaseList"){
        this.purchaseList.clearList();
        this.drawList($, this.purchaseList.list, id);
        }
    if (id == "shoppingList") {
        this.shoppingList.clearList();
        this.drawList($, this.shoppingList.list, id);
        }
    this.clearInputs($);
}

Shopping.prototype.addItem = function($) {
    var item;
    item = {
        "name" : $("#itemName").val(),
        "priority" : parseInt($("#itemPriority").val()),
        "price" : parseFloat($("#itemPrice").val().replace("$", "")),
        "quantity" : parseInt($("#itemQuantity").val())
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

Shopping.prototype.editItem = function($, index) {
}

Shopping.prototype.shop = function($) {
    var shoppingList = this.shoppingList.list;
    var purchaseList = this.purchaseList.list;
    console.log("Let's Go Shopping!")
    var budget = $("#budget").val();
    for (sListIndex = 0; sListIndex < shoppingList.length; sListIndex++) {
        var item = shoppingList[sListIndex];
        pListIndex = this.purchaseList.addItem(item);
        purchaseItem = purchaseList[pListIndex];
        i = 1;
        while((item['quantity'] >= i) && (budget >= (item['price'] * i))) {
            i++;
        }
        i--;
        budget -=  item['price'] * i;
        item['quantity'] -= i;
        purchaseItem['quantity'] = i;
    }
    this.purchaseList.trim();
    this.shoppingList.trim();
    this.drawList($, this.shoppingList.list, "shoppingList");
    this.drawList($, this.purchaseList.list, "purchaseList");
    $('#budget').val(budget.toString());
}

Shopping.prototype.storeList = function($, listID) {
    var transaction = this.db.transaction([listID+"s"], "readwrite");

    var store = transaction.objectStore(listID+"s")

    if (listID == "shoppingList") {
        var name = $("#sListSelector").val();
        var list = this.shoppingList.list;
    }
    else {
        var name = $("pListSelector").val();
        var list = this.purchaseList.list;
    }

    var entry = {
        name: name,
        created: new Date().getTime(),
        list: list
    }
    var request = store.add(entry);
 
    request.onerror = function(e) {
        console.log("Error", e.target.error.name);
    }

    request.onsuccess = function(e) {
        console.log("Added list " + name);
    }

}

Shopping.prototype.loadList = function($, listID) {
    var transaction = this.db.transaction([listID+"s"], "readonly");

    var store = transaction.objectStore(listID+"s")

    if (listID == "shoppingList") {
        var key = $("#sListSelector").data("key");
    }
    else {
        var key = $("pListSelector").data("key");
    }

    var request = store.get(Number(key));

    request.onsuccess = function(e) {
        var result = e.target.result;
        console.log("Got list!")
    }

    request.onerror = function(e) {
        console.log("Error");
    }

    if (listID == "shoppingList") {
        this.shoppingList.list = result.list;

    }
    else {
        this.purchaseList.list = result.list;
    }

    this.drawList($, this.shoppingList.list, "shoppingList");
    this.drawList($, this.purchaseList.list, "purchaseList");

}

Shopping.prototype.loadDataLists = function($, id) {

}
