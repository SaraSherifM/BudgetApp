

//independent stand alone modules
//Sepration of concerns
//How will they communicate together
//First Module
//IIFE containing Private //Public
var budgetController = (function(){

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    //Individual percentage
    Expense.prototype.calcPercentage = function (totoalIncome){

        if( totoalIncome > 0){
            this.percentage = Math.round((this.value/totoalIncome)*100);
        }else{
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    var data = {
        allItems:{
            exp:[],
            inc:[]
        },

        totals:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1//not existing
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum+= cur.value;
        });
        data.totals[type] = sum;
    };
    return {
        addItem: function(type,desc,val){
            var newItem;
            //create new ID 
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id  + 1;
            }
            else{
                ID = 0
                
            }
            

            //create new Item based on exp or inc
            if(type === 'exp'){
                newItem = new Expense(ID,desc,val)
            } else if(type === 'inc'){
                newItem = new Income(ID,desc,val)
            }

            //push it into our data structure
            data.allItems[type].push(newItem);

            //return new element
            return newItem;
        },
        deleteItem: function(type, id){
            var id, index;
            // id is not the index !!
            //loop by map similar to forEach But the main difference is that map returns a new array
             ids = data.allItems[type].map(function(current,){
                return current.id;
            });

             index = ids.indexOf(id);
             
             if(index !== -1){
                data.allItems[type].splice(index,1);
             }

        },
        calculateBudget: function(){
            //calculate total income And expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent //Global Percentage
            if(data.totals.inc > 0 ){
                data.percentage = Math.round((data.totals.exp /data.totals.inc )*100);
               
            }else{
                data.percentage = -1;
                
            }
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        //individual expense percentages
        calcualtePercentages: function(){
            data.allItems.exp.forEach(function(element){
                element.calcPercentage(data.totals.inc);
            });

        },
        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(per){
                return per.getPercentage();
            });
            return allPercentages;
        },
        testing: function(){

            console.log(data)
        }
    }
})();


//Second Module  
var UIController = (function(){

var DOMstrings = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputValue:'.add__value',
    inputButton:'.add__btn',
    incomeContainer:'.income__list',
    expenseContainer:'.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensePercentage:'.item__percentage',
    dataLabel: '.budget__title--month'
};


var formattNumber = function(num, type){
    var numSplit , int , dec;
    // + or - before number 
    //exactly 2 decimal points
    //comma seprating thousonds
    // 2310.457 --> 2,310.46 or 2000 --> 2,000.00
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if(int.length > 3){
        int = int.substr(0,int.length - 3)+','+int.substr(int.length - 3,int.length);
    };
    
    //(type === 'exp' ? sign ='-':sign = '+');

    return (type === 'exp' ? sign ='-':sign = '+') +' ' + int +'.' + dec;
};
var nodeListForEach = function(list,callback){
    for( var i = 0; i< list.length; i++ ){
        callback(list[i],i);
    }
};


    return {
  getInput: function(){
        //a select element returns inc for income or exp for expense
        //return all the three variable in an array or Object
        return {
         type : document.querySelector(DOMstrings.inputType).value,
         source : document.querySelector(DOMstrings.inputDesc).value,
         value : parseFloat(document.querySelector(DOMstrings.inputValue).value),
        } 
    },
    addListItem: function(obj, type){
        //create html string with placeholder text
        var html, newHtml, element;

        if(type === 'inc'){
            element = DOMstrings.incomeContainer;

            html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description"> %description% </div><div class="right clearfix"> <div class="item__value"> %value% </div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

        }
        else if(type === 'exp'){
           element = DOMstrings.expenseContainer;

           html =  ' <div class="item clearfix" id="exp-%id%"><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
       
        }
        //Replace the placeholder %text% text with actual data 
        //html is  string and we can use string methodes on it
        newHtml = html.replace('%id%',obj.id);
        newHtml = newHtml.replace('%description%',obj.description);
        newHtml = newHtml.replace('%value%',formattNumber(obj.value,type));

        //insert into DOM //we first need to select element on the DOM and then add item next to it
        document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)

    },
    deleteListItem: function(selectorID){
        //we can only remove a child
        var element = document.getElementById(selectorID);
        element.parentNode.removeChild(element);
    },

    clearFields:function(){
        var fields,fieldsArray;
        //query selectorAll returns a list we will convert to an array by passing the list to slice methode
        //this methodeisinsidearray`s prototype
        fields =  document.querySelectorAll(DOMstrings.inputDesc + ',' + DOMstrings.inputValue);
        //use call methode pass fields trick it to think its an array and return array
        fieldsArray = Array.prototype.slice.call(fields);

        //this callback function can recieve up to 3 arguments
        fieldsArray.forEach(function(current, index, array) {
            current.value = "";
            
        });
        //set the focus back to the first field
        fieldsArray[0].focus(); 
    },

    displayBudget: function(obj){
        var type;
        obj.budget > 0 ? type = 'inc' : type ='exp';

        document.querySelector(DOMstrings.budgetLabel).textContent = formattNumber(obj.budget,type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formattNumber(obj.totalInc,'inc');
        document.querySelector(DOMstrings.expenseLabel).textContent = formattNumber(obj.totalExp,'exp');
        if(obj.percentage > 0){
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage +' %';
        }else{
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';

        }


    },
    displayPercentages: function(percentages){
        
    //returns node list we can not use array methodes without converting
    var fields = document.querySelectorAll(DOMstrings.expensePercentage);
    //we will create our own forEach
   
    nodeListForEach(fields, function(current,index){
        if(percentages[index] > 0){
            current.textContent = percentages[index] +  '%';
        }else{
            current.textContent = '--'; 

        }
        
    });

    },
    displayMonth: function(){
        var now, year , month;
        //returns date of today
         now = new Date();
        //11 is last month because its zero position
        //var christmas = new Date(2020,11,25);
        months = ['Jan','Feb','March','April','May','June','July','August','Sep','Oct','Nov','Dec'];
        year = now.getFullYear();
        month = now.getMonth();
        document.querySelector(DOMstrings.dataLabel).textContent = months[month] +'/'+ year;

    },
    changeType: function (){
        //getting nodeList to give them red focus class
        var fields = document.querySelectorAll(
            DOMstrings.inputType +','+ 
            DOMstrings.inputDesc +','+ 
            DOMstrings.inputValue
            );

            nodeListForEach(fields, function (curr){
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    },

  getDOMstrings:function(){
    return DOMstrings;
  }
};

})();



//Third communicating controller
//we will pass arguments to this module which is the other 2 modules 
//add event listener to button

var controller = (function( budgetCtrl, UICtrl){

    //in order to be able to use and call it we need to creat public intialization function
    var setupEventListner = function (){

    var DOM = UICtrl.getDOMstrings();

    //select button
    document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);

    //we want hitt on enter to do the same ==> add keypress event
     document.addEventListener('keypress',function(event){
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
            //console.log('Enter was pressed'); 
         }
    }); 

    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType)

}
    
    var updateBudget = function(){
        //1- calculate Budget
        budgetCtrl.calculateBudget();

        //2- return Budget
        var budget = budgetCtrl.getBudget();

        //3- display on user inteface UI controller
        UICtrl.displayBudget(budget);
        //console.log(budget);
    };

    var updatePercentage = function(){
        //1- calculate percentage 
        budgetCtrl.calcualtePercentages();
        //2- read pervcentage frm budget controller
        var percentages = budgetCtrl.getPercentages();
        //console.log(percentages);
        //3- update user interface with percentage on the screen
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){

        var input ,newItem;

        //1- get filed input data//Create a function for that
        input = UICtrl.getInput();
        //console.log(input);

        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
        //2- add item to budget controller
        newItem = budgetCtrl.addItem(input.type, input.source,input.value);
        //3- add new item to UI controller
        UICtrl.addListItem(newItem,input.type);
        //4- Clear Input Fields
        UICtrl.clearFields();
        //5 - calculate and update Budget budget 
        updateBudget(); 
        //6 - calcualte and update percentages
        updatePercentage();
         
        }
         
    };
    var ctrlDeleteItem = function(event){
        var itemID, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //1- Delete item from Data structure
            budgetCtrl.deleteItem(type,ID);
            //2- Delete from UI
            UICtrl.deleteListItem(itemID);
            //3- update and show new budget
            updateBudget();
        }
    };

    return {
        init:function(){
            console.log('App started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1 });

            setupEventListner();

            UICtrl.displayMonth();
        }
    };
   
})(budgetController, UIController);

//Because it is public
 controller.init();