import moment from 'moment';
import $ from 'jquery';

/* ------------------------------ todos ---------------------------
 * Add a query to database to get an array of matrices
 * remove the randomly generated matrices from the constructor
 * test extensively after plugged into the API
 * Possibly try to optimize the getMatricesByDateTerm
 * --------------------------------------------------------------*/

class matrice{
  constructor(date, lease, price, id){
    this.uuid = id;
    this.date = date;
    this.leaseTerm = lease;
    this.price = price;
  }
}

class matriceManager{
  constructor(){
    this.matrices = [];  // an array of objects that will hold all matrices info
    for(var m = 0; m <= 90; m++){
      var tempDate = moment().add(m, 'days');
      this.matrices[this.matrices.length] = new matrice(tempDate, 1, Math.floor(Math.random()*200)+1400, this.matrices.length);
      this.matrices[this.matrices.length] = new matrice(tempDate, 6, Math.floor(Math.random()*200)+1400, this.matrices.length);
      this.matrices[this.matrices.length] = new matrice(tempDate, 9, Math.floor(Math.random()*200)+1400, this.matrices.length);
      this.matrices[this.matrices.length] = new matrice(tempDate, 12, Math.floor(Math.random()*200)+1400, this.matrices.length);
    }
  }
  // Get a matrice by a selected day and leaseTerm
  getMatricesByDateTerm(date, term){
    return this.matrices.filter(function(mat){
      return (mat.date.dayOfYear() === date.dayOfYear() && term === mat.leaseTerm);
    });
  }
  // Get matrices from the server and populate an array of all matrices.
  getMatricesFromServer(unitNumber){
  }
}

export default new matriceManager();
