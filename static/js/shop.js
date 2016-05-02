var shopping = new Shopping();
function Shopping() {
    this.shoppingList = new ItemList();
    this.purchaseList = new ItemList();
    this.db = new PouchDB( "lists" );
    var remoteCouch = false;
}

Shopping.prototype.drawList = function( list, listID ) {
    var table = $( "table#" + listID );
    table.children( "tbody" ).remove();
    table.append( "<tbody />" );
    if ( listID == "shoppingList" ) {
        for ( var i = 0; i < list.length; i++ ) {
            var item = list[i];
            var onclick = "shopping.editItem(\'" + listID + "\', " + i + ")";
            table
                .children( "tbody" )
                .append(
                    $( "<tr>" ).attr( "onclick", onclick )
                )
                .children( "tr:last" )
                .append( $( "<td>" )
                    .text( item["priority"] )
                )
                .append( $( "<td>" )
                    .text( item["name"] )
                )
                .append( $( "<td>" )
                    .text( "$" + item["price"].toFixed(2) )
                )
                .append( $( "<td>" )
                    .text( item["quantity"] )
                )
        }
    } else {
        for ( var i = 0; i < list.length; i++ ) {
            var item = list[i];
            table
                .children( "tbody" )
                .append(
                    $( "<tr>" )
                )
                .children( "tr:last" )
                .append($( "<td>" )
                    .text( item["name"] )
                )
                .append($( "<td>" )
                    .text( "$" + item["price"].toFixed(2) )
                )
                .append($( "<td>" )
                    .text( item["quantity"] )
                )
        }
    }
}

Shopping.prototype.clearInputs = function() {
    $itemInputs = $( "td>input" );
    for ( i in $itemInputs.toArray() ) {
        $itemInputs.eq( i ).val( "" );
    }
}

Shopping.prototype.clearList = function( listID ) {
    if ( listID == "purchaseList" ){
        this.purchaseList.clearList();
        this.drawList( this.purchaseList.list, listID );
    } else {
        this.shoppingList.clearList();
        this.drawList( this.shoppingList.list, listID );
        };
    this.clearInputs();
}

Shopping.prototype.addItem = function() {
    var item;
    item = {
        "name" : $("#itemName").val(),
        "priority" : parseInt( $( "#itemPriority" ).val() ),
        "price" : parseFloat( $( "#itemPrice" ).val().replace( "$", "" ) ),
        "quantity" : parseInt( $( "#itemQuantity" ).val() )
    }
    try {
        this.shoppingList.addItem( item );
    }
    catch( err ) {
        throw( err );
    }
    console.log( "Added item: " + item.name );
    this.drawList( this.shoppingList.list, "shoppingList" );
    this.clearInputs();
    $( ".itemPriority>input" ).focus();
};

Shopping.prototype.removeItem = function( index ) {
    this.shoppinglist.removeItem( index );
};

Shopping.prototype.editItem = function( listID, index ) {
    var list;
    if ( listID == "shoppingList" ) {
        list = this.shoppingList;
    } else {
        list = this.purchaseList;
    }
    var item = list.list[ index ];
    console.log(listID);
    console.dir(list);
    $( "#itemPriority" ).val( item[ "priority" ] );
    $( "#itemName" ).val( item[ "name" ] );
    $( "#itemPrice" ).val( item[ "price" ] );
    $( "#itemQuantity" ).val( item[ "quantity" ] );
    list.removeItem( index );
    this.drawList( list.list, listID );
}

Shopping.prototype.shop = function() {
    var shoppingList = this.shoppingList.list;
    var purchaseList = this.purchaseList.list;
    console.log( "Let's Go Shopping!" )
    var budget = $( "#budget" ).val();
    for ( sListIndex = 0; sListIndex < shoppingList.length; sListIndex++ ) {
        var item = shoppingList[ sListIndex ];
        pListIndex = this.purchaseList.addItem( item );
        purchaseItem = purchaseList[ pListIndex ];
        i = 1;
        while( ( item[ "quantity" ] >= i ) && ( budget >= ( item[ "price" ] * i ) ) ) {
            i++;
        }
        i--;
        budget -=  item[ "price" ] * i;
        item[ "quantity" ] -= i;
        purchaseItem[ "quantity" ] = i;
    }
    this.purchaseList.trim();
    this.shoppingList.trim();
    this.drawList( this.shoppingList.list, "shoppingList" );
    this.drawList( this.purchaseList.list, "purchaseList" );
    $( "#budget" ).val( budget.toString() );
}

Shopping.prototype.storeList = function( listType ) {
    var name;
    var list;
    if ( listType == "shoppingList" ) {
        name = $( "#sListSelector" ).val();
        list = this.shoppingList.list;
    } else {
        name = $( "#pListSelector" ).val();
        list = this.purchaseList.list;
    }
    var entry = {
        _id: name,
        type: listType,
        list: list
    }
    new PouchDB( "lists" ).then( function( db ) {
        db.put( entry ).then( function( result ) {
            console.log( "Added list " + name + " at id " + entry._id );
        } ).catch( function( err ) {
            return db.get( name ).then( function( result ) {
                entry[ "_rev" ] = result._rev;
                console.log( "Editing list " + name,
                        " at id " + entry._id,
                        " and revision " + entry._ );
                return db.put( entry );
            } ).catch( function( err ) {
                console.log( err );
            } )
        } );
    } );
    this.loadDataLists();
};

Shopping.prototype.loadList = function( listType ) {
    var id = $( "#" + listType ).val();
    var list;
    this.db.get( id ).then( function( result ) {
        if ( result.type == "shoppingList" ) {
            shopping.shoppingList.list = result.list;
        } else {
            shopping.purchaseList.list = result.list;
        }
        shopping.drawList( result.list, result.type );
        return Promise.resolve( result.list );
    } ).catch( function( err ) {
        console.error( err );
    } );
};

Shopping.prototype.loadDataLists = function() {
    return this.db.allDocs( {
        include_docs: true
    } ).then( function( result ) {
        var sDL = $( "dataList#sLists" );
        sDL.children().remove();
        var pDL = $( "dataList#pLists" );
        pDL.children().remove();
        for ( r in result.rows ) {
            doc = result.rows[ r ].doc;
            var option = $( "<option>" )
                    .attr( "value", doc._id );
            if ( doc.type == "shoppingList" ) {
                sDL.append( option );
            } else {
                pDL.append( option );
            };
        };
    }).catch( function( err ) {
        console.error( err );
    });
};
