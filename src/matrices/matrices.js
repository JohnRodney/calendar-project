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
    var that = this;
    return this.matrices.filter(function(mat){
      if(that.cheapest > mat.finalRent){
        that.cheapest = mat.finalRent;
        that.activeLease = mat.leaseTerm;
      }
      that.cheapest = Math.min(that.cheapest, mat.finalRent);
      if(moment(mat.moveInDate).dayOfYear() <= that.earliestMoveIn.dayOfYear() &&
         moment(mat.moveInDate).year() <= that.earliestMoveIn.year()){
        that.earliestMoveIn = moment(mat.moveInDate);
      }
      if(moment(mat.moveInDate).dayOfYear() >= that.lastMoveIn.dayOfYear() &&
         moment(mat.moveInDate).year() >= that.lastMoveIn.year()){
        that.lastMoveIn = moment(mat.moveInDate);
      }

      return (term === mat.leaseTerm);
    });
  }
  // break the overall array into 15 lease arrays
  breakUpArray(){
    this.earliestMoveIn = moment().add('200', 'days');
    this.lastMoveIn = moment();
    console.log(this.earliestMoveIn);
    this.cheapest = 90000;
    this.byLease = [];
    this.availableLeases = [];
    for(var x = 0; x < 15; x++){
      this.byLease[x] = this.filterByLease(x+1);
      if(this.byLease[x].length === 0){
        this.availableLeases[x] = false;
      }
      else{
        this.availableLeases[x] = true;
        this.activeLease = x+1;
      }
    }
    console.log(this.earliestMoveIn);
    console.log(this.lastMoveIn);
    console.log(this.cheapest);
    console.log(this.activeLease);
    this.renderInfo();
    return true;
  }
  fillSelectBox(){
    var html = '';
    for(var x = 0; x < 15; x++){
      if(this.availableLeases[x]){
        if(this.activeLease === (x+1)){
          html += "<option selected=\"selected\">" + (x+1);
        }
        else{
          html += "<option>" + (x+1);
        }
        if(x === 0){
          html += " month</option>"
        }
        else{
          html += " months</option>"
        }
      }
    }
    $('.cal-select-holder select').html(html);
  }
  renderInfo(){
    this.fillSelectBox();
    console.log($('.cal-select-holder select').html());
    this.renderCheapest();
  }
  // calculate the index in the array by the date passed
  getIndexByDate(date){
    var checkDate = moment(date);
    for(var x = 0; x < this.byLease[this.activeLease-1].length; x++){
      var prev = -1, next = -1;
      var current = moment(this.byLease[this.activeLease-1][x].moveInDate);
      if(x > 0){
        prev = moment(this.byLease[this.activeLease-1][x-1].moveInDate);
      }
      if(x < this.byLease[this.activeLease-1].length-1){
        next = moment(this.byLease[this.activeLease-1][x+1].moveInDate);
      }
      if(checkDate.dayOfYear() === current.dayOfYear()){
        return x;
      }
      else if(prev !== -1){
        if(checkDate.dayOfYear() > prev.dayOfYear() &&
           checkDate.dayOfYear() < current.dayOfYear()){
          return x-1;
        }
      }
      else if(next !== -1){
        if(checkDate.dayOfYear() > current.dayOfYear() &&
           checkDate.dayOfYear() < next.dayOfYear()){
          return x;
        }
      }
    }
  }
  // calculates the first day that is available for the lease term.
  getFirstMoveInDate(){
    return this.byLease[this.activeLease-1][0].moveInDate;
  }
  // the activelease to change cheapest value
  setActiveLease(num){
    this.activeLease = num;
    this.cheapest = this.getCheapest(num);
    this.renderCheapest();
    this.moveInDate = moment(this.getFirstMoveInDate());
  }
  getRedirect(id){
    var toSend = {id: id};
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "http://5b45b4e6.ngrok.com/v1/rent-matrix");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(toSend));
    xmlhttp.onreadystatechange = function(){
      if(xmlhttp.readyState == 4 && xmlhttp.status == "200"){
        var url = JSON.parse(xmlhttp.responseText);
        window.location.replace(url.url);
      }
    }
  }
  // loads the matrices from the test server
  testLoader(self, callback, nid){
    var that = self || this;
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'http://5b45b4e6.ngrok.com/v1/'+nid+'/rent-matrix', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            // Get and Save Data
            console.log(JSON.parse(xobj.responseText));
            that.matrices = JSON.parse(xobj.responseText);
            // Break up into arrays for each lease term then save cheapest
            // Earliest Move In Date and Last Move In Date
            that.breakUpArray();
            that.indexControl = 0;
            callback();
          }
    };
    xobj.send(null);
  }
}

export default new matriceManager();
