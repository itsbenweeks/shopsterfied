function ItemList(options) {
    this.list = [];
}

ItemList.prototype.findIndex = function(priority) {
    var list = this.list;
    if (list.length == 0) {
        return 0;
    }
    for (index in list) {
        if (list[index]['priority'] >= priority) {
            return index;
        }
    }
    return list.length;
};

ItemList.prototype.addItem = function(item) {
    try {
        checkItem(item);
    }
    catch(err) {
        throw(err);
    }
    var newItem = jQuery.extend(true, {}, item);
    var list = this.list;
    var priority = newItem['priority'];
    var index = this.findIndex(priority);
    list.splice(index, 0, newItem);
    return index;
};

ItemList.prototype.clearList = function() {
    this.list = [];
};

ItemList.prototype.removeItem = function(index) {
    return this.list.splice(index, 1);
};

ItemList.prototype.trim = function() {
    for (i = this.list.length - 1; i >= 0; i--) {
         if (this.list[i]['quantity'] == 0) {
             this.removeItem(i);
         }
     }
}

ItemList.prototype.bind = function(obj) {
    var method = this,
    temp = function() {
        return method.apply(obj, arguments);
    }
    return temp;
};

function checkName(name) {
    if (typeof(name) != "string"){
        throw "Name is not a string";
    }
    else if (name.length > 35) {
        throw "Name is too long (35 Characters of less)";
    }
};

function checkPriority(priority) {
    if (isNaN(priority)) {
        throw "Priority is not a number";
    }
    if (priority < 1) {
        throw "Priority is less than 1";
    }
};

function checkPrice(price) {
    if (isNaN(price)) {
        throw "Price is not a number";
    }
    if (price <= 0) {
        throw "Price is zero or less";
    }
};

function checkQuantity(quantity) {
    if (isNaN(quantity)) {
        throw "Priority is not a number";
    }
    if (quantity < 1) {
        throw "Quantity is less than 1";
    }
}

function checkItem(item) {
    try {
        checkPriority(item.priority);
        checkName(item.name);
        checkPrice(item.price);
        checkQuantity(item.quantity);
    }
    catch(err) {
        throw(err);
    }
}
