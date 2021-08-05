const Modal = {
    open(){
        //Open Modal
        //Add active class to Modal-overlay div
        document.querySelector('.modal-overlay').classList.add('active')
    },

    close(){
        //Close Modal
        //Remove active class from Modal-overlay div
        //I could also use only one method and use toggle.
        document.querySelector('.modal-overlay').classList.remove('active')
    }
};

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },
    set(transaction){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction));
    }
};

const Transaction = {
    all: Storage.get(),
    add(transaction){
        Transaction.all.push(transaction);

        App.reload();
    },
    remove(index){
        Transaction.all.splice(index, 1);

        App.reload();
    },
    incomes(){
        //sum the entries
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses(){
        //sum the exits
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total(){
        //entries - exits
        return Transaction.incomes() + Transaction.expenses();
    }
};

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index){
        const CSSClass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);
        
        const html = `
        
            <td class="description">${transaction.description}</td>
            <td class=${CSSClass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remove transaction"></td>
        
        `
        return html;
    },

    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = "";
    }
};

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-": "";

        value = String(value).replace(/\D/g, "");
        value = Number(value)/100;

        value = value.toLocaleString("en-IR", {
            style: "currency", 
            currency: "EUR"
        });
        

        return signal + value;
    },
    formatAmount(value){
        value = value *100;

        return Math.round(value);
    },
    formateDate(date){
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form ={
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        const{ description, amount, date } = Form.getValues();

        if(description.trim() ==="" || amount.trim() === "" || date.trim() === ""){
            throw new Error("All fields are required");
        }
    },
    formatValues(){
        let{ description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formateDate(date);
        return{
            description, amount, date
        }

    },
    saveTransaction(transaction){
        Transaction.add(transaction);
    },
    clearFields(){
        Form.description.value="";
        Form.amount.value="";
        Form.date.value="";
    },
    submit(event){
        event.preventDefault()

        try{
            Form.validateFields();
            const transaction = Form.formatValues();
            Form.saveTransaction(transaction);
            Form.clearFields();
            Modal.close();
        } catch(error){
            alert(error.message);
        }
    }
};

const App = {
    init(){
        Transaction.all.forEach(DOM.addTransaction);
        /*Transaction.all.forEach((transaction, index) =>{
            DOM.addTransaction(transaction, index);
        })*/

        DOM.updateBalance();
        Storage.set(Transaction.all);
    },

    reload(){
        DOM.clearTransactions();
        App.init();
    }
};

App.init();
