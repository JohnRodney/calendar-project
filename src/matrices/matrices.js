import moment from 'moment';
import $ from 'jquery';

/* ------------------------------ todos ---------------------------
 * Add a query to database to get an array of matrices
 * remove the randomly generated matrices from the constructor
 * test extensively after plugged into the API
 * Possibly try to optimize the getMatricesByDateTerm
 * --------------------------------------------------------------*/

class matriceManager{
  constructor(){
    this.testLoader();
    this.activeLease = 1;
  }
  // store the cheapest value by the selected term.
  getCheapest(term){
    var cheapest = 900000;
    for(var x = 0; x < this.matrices.length; x++){
      if(this.matrices[x].leaseTerm === term){
        cheapest = Math.min(cheapest, this.matrices[x].finalRent);
      }
    }
    return cheapest;
  }
  // get Matrices by index
  getMatricesByIndex(index){
    return [this.byLease[this.activeLease-1][index]];
  }
  // return a matrice by the date and term passed
  getMatricesByDateTerm(date, term){
    return this.byLease[term-1].filter(function(mat){
      return (moment(mat.moveInDate.$date).dayOfYear() === date.dayOfYear());
    });
  }
  renderCheapest(){
    var base = $('.base-rent-holder');
    if(base.length > 0){
      base.html("$" + this.cheapest);
      return true;
    }
    return false;
  }
  // Get matrices from the server and populate an array of all matrices.
  getMatricesFromServer(unitNumber){

  }
  // break the overall query into a smaller array of just the passed lease term
  filterByLease(term){
    return this.matrices.filter(function(mat){
      return (term === mat.leaseTerm);
    });
  }
  // break the overall array into 15 lease arrays
  breakUpArray(){
    this.byLease = [];
    for(var x = 0; x < 15; x++){
      this.byLease[x] = this.filterByLease(x+1);
    }
    return true;
  }
  // calculate the index in the array by the date passed
  getIndexByDate(date){
    var checkDate = moment(date);
    var diff = checkDate.dayOfYear() - this.moveInDate.dayOfYear();
    if(diff < 0){
      return -1;
    }
    else{
      return diff/2;
    }
  }
  // calculates the first day that is available for the lease term.
  getFirstMoveInDate(){
    return this.byLease[this.activeLease-1][0].moveInDate.$date;
  }
  // the activelease to change cheapest value
  setActiveLease(num){
    this.activeLease = num;
    this.cheapest = this.getCheapest(num);
    this.renderCheapest();
    this.moveInDate = moment(this.getFirstMoveInDate());
  }
  // loads the matrices from the test server
  testLoader(callback){
    var that = this;
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'http://localhost:3000/matrices', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            that.matrices = JSON.parse(xobj.responseText);
            that.breakUpArray();
            that.cheapest = that.getCheapest(that.activeLease);
            that.renderCheapest();
            that.moveInDate = moment(that.getFirstMoveInDate());
          }
    };
    xobj.send(null);
  }
}

export default new matriceManager();
