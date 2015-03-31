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
    this.testLoader();  // an array of objects that will hold all matrices info
  }
  // Get a matrice by a selected day and leaseTerm
  getCheapest(term){
    var cheapest = 900000;
    for(var x = 0; x < this.matrices.length; x++){
      if(this.matrices[x].leaseTerm === term){
        cheapest = Math.min(cheapest, this.matrices[x].finalRent);
      }
    }
    this.cheapest = cheapest;
  }
  getMatricesByDateTerm(date, term){
    return this.byLease[term-1].filter(function(mat){
      return (moment(mat.moveInDate.$date).dayOfYear() === date.dayOfYear());
    });
  }
  // Get matrices from the server and populate an array of all matrices.
  getMatricesFromServer(unitNumber){
  }
  filterByLease(term){
    return this.matrices.filter(function(mat){
      return (term === mat.leaseTerm);
    });
  }
  breakUpArray(){
    this.byLease = [];
    for(var x = 0; x < 15; x++){
      this.byLease[x] = this.filterByLease(x+1);
    }
  }
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
            that.getCheapest(1);
          }
    };
    xobj.send(null);
  }
}

export default new matriceManager();
